function conditionalOption(id, show) {
    if (show) {
        document.getElementById(id).classList.remove('display-none');
    } else {
        document.getElementById(id).classList.add('display-none');
    }
}

function checkEligibility() {
    var businessOwnFalse = document.getElementById('business-own_option_1').checked;
    var businessUsaFalse = document.getElementById('business-usa_option_1').checked;

    if ( businessOwnFalse || businessUsaFalse ) {
        window.location.href = 'eligibility-option-1-not-eligible.html';
    } else {
        window.location.href = 'eligibility-option-1-eligible.html';
    }
}