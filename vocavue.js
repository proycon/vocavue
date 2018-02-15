function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function setbackground() {
    var daytime = 'day'; //TODO: compute with suncalc
    var background_idx = getRandomInt(background_count[daytime])+1;
    $('#background').css("background-image", "url(backgrounds/" + daytime + "/" + background_idx + ".jpg)").show(1000);
}

function newcard() {
    var card_idx = getRandomInt(vocab[vocab_set].length);
    var card = vocab[vocab_set][card_idx];
    $('#card #word').html(card.word);
    if (typeof card.translation !== undefined) {
        $('#card #translation').html(card.translation);
    }
    if (typeof card.transcription !== undefined) {
        $('#card #transcription').html(card.transcription);
    }
    $('#card #word').show();
    $('#card #translation').hide();
    $('#card #transcription').hide();
    $('#card').show(250);
}

function setposition(position) {
    latitude = position.latitude;
    longitude = position.longitude;
}
function flip() {
    if ($('#word').is(':visible')) {
        $('#word').hide(250);
        $('#translation').show(250);
        $('#transcription').show(250);
    } else {
        $('#translation').hide(250);
        $('#transcription').hide(250);
        $('#word').show(250);
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

//on page load
$(function(){
    //if (navigator.geolocation) navigator.geolocation.getCurrentPosition(setposition);
    setbackground();
    newcard();
    $('#word').click(flip);
    $('#translation').click(flip);
    $('#transcription').click(flip);
    $('button').click(nextcard);
    var linkbody = "<ul>";
    for (var i = 0; i < links.length; i++) {
        linkbody += "<li><a href=\"" + links[i].url + "\">" + links[i].label + "</li>";
    };
    linkbody += "</ul>";
    $('#links').html(linkbody);
});
