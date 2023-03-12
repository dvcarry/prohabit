Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
};



function getDates(startDate, stopDate) {
    startDate.setHours(0, 0, 0, 0);
    stopDate.setHours(0, 0, 0, 0);
    let dateArray = new Array();
    let currentDate = stopDate;
    while (currentDate >= startDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
};

function calcSeries(dones) {

    let result = 0;
    let currentDate = new Date();
    let today = new Date();

    if (dones[0].toLocaleDateString() === today.toLocaleDateString()) {
        result++
        dones.shift()
    };
    console.log('try', dones)
    for (let i = 0; i < dones.length; i++) {
        console.log('try', dones[i].toLocaleDateString(), currentDate.addDays(i + 1).toLocaleDateString())
        if (dones[i].toLocaleDateString() === currentDate.addDays(i + 1).toLocaleDateString()) {
            result++
        } else {
            break;
        }
    }

    return result;
};

module.exports = { getDates, calcSeries }