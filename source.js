javascript:(function() {
    function parseAndConvertToLocal(timeString, topLevel = true) {
        timeString = timeString.replace("Period:","").replace("(JST)", "").replaceAll(".", "").replaceAll(",", "").replace("–","-").trim();
        const now = new Date();
        const timeZone = now.toLocaleDateString(undefined, {timeZoneName: 'short' }).slice(-3);
    
        // Handle multiple time ranges separated by "and"
        if (timeString.includes("and")) {
            return timeString.split("and").map(e => parseAndConvertToLocal(e.trim(), false)).join(" and ") + `${topLevel? " " + timeZone : ""}`;
        }
    
        // Handle time ranges separated by "-"
        if (timeString.includes("-")) {
            return timeString.split("-").map(e => parseAndConvertToLocal(e.trim(), false)).join(" - ") + `${topLevel? " " + timeZone : ""}`;
        }
    
        let fullString = timeString;
        match = timeString.match(/(\d{1,2}((:\d{2})|\s[A|P|a|p][mM]))(\s[A|P|a|p][mM])?\s*,?\s*([a-zA-Z]{3}\s\d{1,2})?/g);
        if (match == undefined) return "Invalid Date";
        timeString = match.slice(-1)[0];
        fullString = fullString.replace(timeString, "__replace__");
    
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
        }
    
        // Format date
        if (date) {
            originalDate = true;
            date = date.replace(/(\w{3}) (\d{1,2})/, (match, p1, p2) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const month = months.indexOf(p1) + 1;
                return `${new Date().getFullYear()}-${month < 10 ? '0' : ''}${month}-${p2.padStart(2, '0')}`;
            });
        } else if (fullString.replace("__replace__", "").match(/\d{1,2}\/\d{1,2}/g)) {
            originalDate = true;
            date = fullString.split("__replace__")[0];
            fullString = fullString.replace(date, "");
            date = `${now.getFullYear()}-${date.replace("/", "-").trim()}`;
        } else {
            date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        }
    
        // Create date string in JST
        const dateTimeString = `${date}T${hour.toString().padStart(2, '0')}:${minute? minute : "00"}:00+09:00`;
        const dateTime = new Date(dateTimeString);
    
        // Format output
        let options = { hour: 'numeric', minute: 'numeric' , hour12: true };
        if (originalDate) {
            options = { ...options, month: 'short', day: 'numeric' };
        }
        
        timeString = dateTime.toLocaleString('en-US', options);
        if (minute == undefined) timeString = timeString.replace(":00", "");
        return fullString.replace("__replace__", timeString) + `${topLevel? " " + timeZone : ""}`;
    }
    
    const selectors = [
        '*[class*="time"]',
        '.prt-bar-txt',
        '*[class*="period"]',
        '.txt-defeat-value',
        '.txt-teaser-title',
        '.txt-schedule'
    ].map(e=>`${e}:not(.local-time)`);
    document.querySelectorAll(selectors.join(', ')).forEach(element => {
        const convertedTime = parseAndConvertToLocal(element.innerHTML);
        if (!convertedTime.includes("Invalid Date")) {
            element.innerHTML = convertedTime;
            element.classList.add("local-time");
            element.dataset.title = "";
        }
    });
})();