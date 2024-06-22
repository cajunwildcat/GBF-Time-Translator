javascript:(function() {
    function parseAndConvertToLocal(timeString) {
    timeString = timeString.replace("(JST)", "").replaceAll(".", "").replaceAll(",", "").replace("–","-").trim();

    // Handle multiple time ranges separated by "and"
    if (timeString.includes("and")) {
        return timeString.split("and").map(e => parseAndConvertToLocal(e.trim())).join(" and ");
    }

    // Handle time ranges separated by "-"
    if (timeString.includes("-")) {
        return timeString.split("-").map(e => parseAndConvertToLocal(e.trim())).join(" - ");
    }

    let time, date;
    let hour, minute;
    let ampm = timeString.includes("am") ? "am" : timeString.includes("pm") ? "pm" : "";
    let originalDate = false;

    // If no am/pm, it's assumed to be in 24-hour format already
    if (ampm === "") {
        [time, date] = timeString.split(" ").map(e => e.trim());
        [hour, minute] = time.split(":");
    } else {
        // Convert to 24-hour time
        [time, date] = timeString.split(ampm).map(e => e.trim());
        [hour, minute] = time.split(":");
        hour = parseInt(hour) % 12;
        if (ampm === "pm") hour += 12;
        minute = minute || "00";
    }

    // Format date
    if (date) {
        originalDate = true;
        date = date.replace(/(\w{3}) (\d{1,2})/, (match, p1, p2) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months.indexOf(p1) + 1;
            return `${new Date().getFullYear()}-${month < 10 ? '0' : ''}${month}-${p2.padStart(2, '0')}`;
        });
    } else {
        const now = new Date();
        date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    }

    // Create date string in JST
    const dateTimeString = `${date}T${hour.toString().padStart(2, '0')}:${minute}:00+09:00`;
    const dateTime = new Date(dateTimeString);

    // Format output
    let options = { hour: 'numeric', minute: 'numeric' , hour12: true };
    if (originalDate) {
        options = { ...options, month: 'short', day: 'numeric' };
    }
    
    timeString = dateTime.toLocaleString('en-US', options);
    if (!minute) timeString.replace(":00", "");
    return timeString;
}
    
    document.querySelectorAll('*[class*="time"]:not(.local-time)').forEach(element => {
        const convertedTime = parseAndConvertToLocal(element.innerHTML);
        if (!convertedTime.includes("Invalid Date")) {
            element.innerHTML = convertedTime;
            element.classList.add("local-time");
            element.dataset.title = "";
        }
    });
})();