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
    $('#card').show();
    $('#card #word').show();
    $('#card #translation').hide();
    $('#card #transcription').hide();
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

//on page load
$(function(){
    //if (navigator.geolocation) navigator.geolocation.getCurrentPosition(setposition);
    setbackground();
    newcard();
    $('#word').click(flip);
    $('#translation').click(flip);
    $('#transcription').click(flip);
});
