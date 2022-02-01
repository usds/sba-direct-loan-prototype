function conditionalOption(id, show) {
    if (show) {
        document.getElementById(id).classList.remove('display-none');
    } else {
        document.getElementById(id).classList.add('display-none');
    }
}