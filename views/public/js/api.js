$(document).ready(function() {
    var count = 5;
    setInterval(function() {
        count--;
        console.log(count)
        if (count === 0) window.location.href = '/';
        if (count > 0) $('.alert h5 strong').text('Auto-redirect in ' + count + '...');
    }, 1000);
});