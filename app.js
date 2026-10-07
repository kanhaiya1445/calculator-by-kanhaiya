(() => {
    "use strict";

    const timeEl = document.getElementById("time");
    const ampmEl = document.getElementById("ampm");
    const dateEl = document.getElementById("date");
    const dayEl = document.getElementById("day");
    const shortDateEl = document.getElementById("shortDate");
    const tzEl = document.getElementById("tz");
    const themeBtn = document.getElementById("themeBtn");

    function updateClock() {
        const now = new Date();

        let hours = now.getHours();

        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours || 12;
        hours = String(hours).padStart(2, "0");

        if (timeEl) {
            timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        }

        if (ampmEl) {
            ampmEl.textContent = ampm;
        }

        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        if (dayEl) {
            dayEl.textContent = now.toLocaleDateString("en-IN", {
                weekday: "long"
            });
        }

        if (shortDateEl) {
            shortDateEl.textContent = now.toLocaleDateString("en-IN");
        }

        if (tzEl) {
            tzEl.textContent =
                Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    // Theme
    const savedTheme = localStorage.getItem("clock-theme");

    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {

            const current =
                document.documentElement.dataset.theme || "dark";

            const next = current === "dark" ? "light" : "dark";

            document.documentElement.dataset.theme = next;

            localStorage.setItem("clock-theme", next);
        });
    }

    // Start clock
    updateClock();

    setInterval(updateClock, 1000);

})();
