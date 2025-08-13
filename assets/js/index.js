const currentIP = document.getElementById("ip_text");
const copyBtn = document.getElementById("copy_ip_btn");
const inputForm = document.getElementById("input_form");
const inputField = document.getElementById("input_field");

const ipField = document.getElementById("ip");
const locationField = document.getElementById("location");
const timezoneField = document.getElementById("timezone");
const ispField = document.getElementById("isp");
const loader = document.getElementById("loader");
const mapContainer = document.getElementById("map");

let map = null;

function getCurrentTimeInTimezone(timeZoneString) {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneString,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return "Invalid timezone";
  }
}

async function fetchCurrentIP() {
  try {
    const response = await fetch("https://api.ipify.org/?format=json");
    const data = await response.json();
    if (currentIP) {
      currentIP.textContent = data?.ip || "8.8.8.8";
    }
  } catch {
    if (currentIP) currentIP.textContent = "8.8.8.8";
  }
}
fetchCurrentIP();

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentIP.textContent);
    alert("Copied!");
  } catch (error) {
    console.error("Copy failed", error);
  }
});

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const trimmedValue = inputField.value.trim();
  if (!trimmedValue) {
    alert("Please enter a valid IP address.");
    return;
  }

  await fetchIpDetails(trimmedValue);
});

async function fetchIpDetails(ip) {
  try {
    if (loader) loader.style.display = "block";
    if (mapContainer) mapContainer.style.display = "none";

    const response = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`);

    if (!response.ok) {
      throw new Error("Invalid input or IP not found.");
    }

    const data = await response.json();

    ipField.textContent = data.ip || "N/A";
    locationField.textContent = `${data.location?.city || "N/A"}, ${data.location?.region || "N/A"}`;

    if (data.location?.timezone) {
      timezoneField.textContent = `${data.location.timezone} (${getCurrentTimeInTimezone(data.location.timezone)})`;
    } else {
      timezoneField.textContent = "N/A";
    }

    ispField.textContent = data.isp || "N/A";

    if (data.location?.lat && data.location?.lng) {
      mapContainer.style.display = "block";
      if (map) map.remove();

      map = L.map("map").setView([data.location.lat, data.location.lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([data.location.lat, data.location.lng]).addTo(map);
    }
  } catch (error) {
    alert(error.message || "Something went wrong.");
  } finally {
    if (loader) loader.style.display = "none";
  }
}
