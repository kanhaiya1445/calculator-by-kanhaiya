(() => {
    "use strict";

    const timeEl = document.getElementById("time");
    const ampmEl = document.getElementById("ampm");
    const dateEl = document.getElementById("date");
    const dayEl = document.getElementById("day");
    const shortDateEl = document.getElementById("shortDate");
    const timezoneEl = document.getElementById("tz");

    const themeBtn = document.getElementById("theme");
    const formatBtn = document.getElementById("format24");
    const secondsBtn = document.getElementById("seconds");

    let is24Hour = false;
    let showSeconds = true;

    // Load saved settings
    const savedFormat = localStorage.getItem("clock-format");
    const savedSeconds = localStorage.getItem("clock-seconds");
    const savedTheme = localStorage.getItem("clock-theme");

    if (savedFormat === "24") {
        is24Hour = true;
    }

    if (savedSeconds === "false") {
        showSeconds = false;
    }

    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
    }

    function updateClock() {
        const now = new Date();

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        let ampm = "";

        if (!is24Hour) {
            ampm = hours >= 12 ? "PM" : "AM";

            hours = hours % 12;

            if (hours === 0) {
                hours = 12;
            }
        }

        const hourText = String(hours).padStart(2, "0");

        timeEl.textContent = showSeconds
            ? `${hourText}:${minutes}:${seconds}`
            : `${hourText}:${minutes}`;

        ampmEl.textContent = is24Hour ? "" : ampm;

        // Full date
        dateEl.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        // Day
        dayEl.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long"
        });

        // Short date
        shortDateEl.textContent = now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        // Time zone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        timezoneEl.textContent = timeZone || "Local Time";
    }

    // 12 / 24 hour button
    if (formatBtn) {
        formatBtn.addEventListener("click", () => {
            is24Hour = !is24Hour;

            localStorage.setItem(
                "clock-format",
                is24Hour ? "24" : "12"
            );

            formatBtn.textContent = is24Hour
                ? "12-HOUR"
                : "24-HOUR";

            updateClock();
        });

        formatBtn.textContent = is24Hour
            ? "12-HOUR"
            : "24-HOUR";
    }

    // Seconds button
    if (secondsBtn) {
        secondsBtn.addEventListener("click", () => {
            showSeconds = !showSeconds;

            localStorage.setItem(
                "clock-seconds",
                showSeconds
            );

            secondsBtn.textContent = showSeconds
                ? "SECONDS: ON"
                : "SECONDS: OFF";

            updateClock();
        });

        secondsBtn.textContent = showSeconds
            ? "SECONDS: ON"
            : "SECONDS: OFF";
    }

    // Theme button
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.dataset.theme === "light"
                    ? "dark"
                    : "light";

            document.documentElement.dataset.theme = currentTheme;

            localStorage.setItem(
                "clock-theme",
                currentTheme
            );
        });
    }

    // Start clock
    updateClock();

    // Update every second
    setInterval(updateClock, 1000);

})();
