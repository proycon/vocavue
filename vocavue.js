reverse = false;
card = {};
weights = {};
weightsum = 0;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function setbackground(force) {
    var now = new Date();
    var sunpos = SunCalc.getTimes(now, latitude, longitude);
    if ((now >= sunpos.sunsetStart && now <= sunpos.dusk) || (now >= sunpos.dawn && now < sunpos.sunriseEnd)) {
        daytime = 'duskdawn';
    } else if ((now >= sunpos.sunset) || (now <= sunpos.sunrise)) {
        daytime = 'night';
    } else  {
        daytime = 'day';
    }
    var changebackground = force;
    if (!changebackground) {
        if (localStorage.daytime != daytime) {
            changebackground = true;
        } else if ((localStorage.background_idx)  && (localStorage.daytime) && (localStorage.lastbackgroundchange)) {
            daytime = localStorage.daytime;
            background_idx = localStorage.background_idx;
            lastbackgroundchange = localStorage.lasttbackgroundchange;
            changebackground =  (Date.now() - lastbackgroundchange > 3600 * 6);
        }
    }
    if (changebackground) {
        background_idx = getRandomInt(background_count[daytime])+1;
        localStorage.setItem("daytime", daytime);
        localStorage.setItem("lastbackgroundchange", Date.now());
        localStorage.setItem("background_idx", background_idx);
    }
    $('#background').css("background-image", "url(backgrounds/" + daytime + "/" + background_idx + ".jpg)").show(1000);
}

function newcard() {
    //var card_idx = getRandomInt(vocab[vocab_set].length);
    var choice = Math.random() * weightsum;
    var card_idx = 0;
    var mass = 0;
    for (var i in vocab[vocab_set]) {
        mass += weights[vocab[vocab_set][i].word];
        if (choice > mass) {
            card_idx = i;
            setcard(card_idx);
        }
    }
}

function setcard(card_idx) {
    card = vocab[vocab_set][card_idx];
    card.weight = weights[card.word];
    $('#card #word').html(card.word);
    if (typeof card.translation !== undefined) {
        $('#card #translation').html(card.translation);
    }
    if (typeof card.example !== undefined) {
        $('#card #example').html(card.example);
    }
    if (typeof card.transcription !== undefined) {
        $('#card #transcription').html(card.transcription);
    }
    var contexttags = [];
    if (typeof card.tags !== undefined) {
        for (var tag of card.tags) {
            if (tag.substr(0,1) == "_") {
                contexttags.push(tag);
            }
        }
    }
    var context = "";
    for (var i = 0; i < vocab[vocab_set].length; i++) {
        var contextcard = vocab[vocab_set][i];
        var add = false;
        for (var contexttag of contexttags) {
            if ((typeof contextcard.tags !== undefined) && (contextcard.tags.includes(contexttag)) && (contextcard != card)) {
                add = true;
                break;
            }
        }
        if (add) {
            context = context + "<li><a href=\"javascript:setcard(" + i + ")\">" + contextcard.word + "</a></li>";
        }
    }
    $('#context').html("<ul>" + context + "</ul>");
    if (!reverse) {
        $('#card #word').show();
        $('#card #example').show();
        $('#card #translation').hide();
        $('#card #transcription').hide();
    } else {
        $('#card #word').hide();
        $('#card #example').show();
        $('#card #translation').show();
        $('#card #transcription').hide();
    }
    $('#stats').html(card.weight + "/" + weightsum);
    $('#card').show(250);
}

function setposition(position) {
    latitude = position.latitude;
    longitude = position.longitude;
}
function flip() {
    if ($('#word').is(':visible')) {
        $('#word').hide(250);
        $('#example').hide(250);
        $('#translation').show(250);
        if (!reverse) {
            $('#transcription').show(250);
        } else {
            $('#transcription').hide(250);
        }
        $('#example').show(250);
    } else {
        $('#translation').hide(250);
        $('#example').hide(250);
        if (!reverse) {
            $('#transcription').hide(250);
        } else {
            $('#transcription').show(250);
        }
        $('#word').show(250);
        $('#example').show(250);
    }
}

function nextcard(){
    $('#card').hide(250, newcard);
}

setInterval(function(){
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        // Add leading zeros
        minutes = (minutes < 10 ? "0" : "") + minutes;
        hours = (hours < 10 ? "0" : "") + hours;
        // Compose the string for display
        var currentTimeString = hours + ":" + minutes;
        $("#clock").html(currentTimeString);
},10);


function setweights() {
  var words = []; //temp
  for (var i in vocab[vocab_set]) {
        var word = vocab[vocab_set][i].word;
        words.push(word);
  }
  return Promise.all(words.map(key => {
    return localforage.getItem(key)
      .then(value => {
        if (value === null) value = 1;
        weightsum += value;
        return { [key]: value }
      })
      .catch(error => {
        weightsum += 1;
        return { [key]: 1 }
      })
  })).then(arr => {
    return Object.assign(...arr)
  })
}

//on page load
$(function(){
    //if (navigator.geolocation) navigator.geolocation.getCurrentPosition(setposition);
    setbackground(false);
    setweights().then((results) => {;
        weights = results;
        newcard();
    });
    $('#word').click(flip);
    $('#translation').click(flip);
    $('#transcription').click(flip);
    $('button.good').click(function() {
        localforage.setItem(card.word, card.weight / 2).then(function(){
            weights[card.word] = card.weight/2;
            weightsum -= card.weight/2;
            nextcard();
        });
    });
    $('button.bad').click(function() {
        localforage.setItem(card.word, card.weight * 2).then(function(){
            weights[card.word] = card.weight*2;
            weightsum += card.weight;
            nextcard();
        });
    });
    var linkbody = "<ul>";
    for (var i = 0; i < links.length; i++) {
        var icon = "<span>&nbsp;</span>";
        if (links[i].icon) {
            if (links[i].icon.substr(0,4) == 'sli:') {
                icon = "<span class=\"" + links[i].icon.substr(4) + "\"></span>";
            } else if (links[i].icon.substr(0,4) == 'mdi:') {
                icon = "<span class=\"material-icons\">" + links[i].icon.substr(4)+"</span>";
            }
        }
        linkbody += "<li>" + icon + "<a href=\"" + links[i].url + "\">" + links[i].label + "</a></li>";
    }
    linkbody += "</ul>";
    $('#links').html(linkbody);
    $('#switchdirection').click(function(){
        reverse = !reverse;
        nextcard();
    });
    $('#switchbackground').click(function(){
        setbackground(true);
    });
});
