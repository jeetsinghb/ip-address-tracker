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

const API_KEY = "";
let map = null; // Will store Leaflet map instance

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
  } catch (e) {
    console.error("Invalid timezone format:", timeZoneString);
    return "Invalid timezone";
  }
}

// Fetch the user's current IP and display it
async function fetchCurrentIP() {
  try {
    const response = await fetch("https://api.ipify.org/?format=json");
    const data = await response.json();
    console.log(data);
    if (currentIP) {
      currentIP.textContent = data?.ip || "8.8.8.8";
    }
  } catch (error) {
    if (currentIP) {
      currentIP.textContent = "8.8.8.8";
    }
  }
}

fetchCurrentIP();

// Copy IP to clipboard
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentIP.textContent);
    alert("Copied!");
  } catch (error) {
    console.error("Copy failed", error);
  }
});

// Handle form submission
inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const trimmedValue = inputField.value.trim();

  if (!trimmedValue) {
    alert("Please enter a valid IP address.");
    return;
  }

  await fetchIpDetails(trimmedValue);
});

// Fetch IP details from IPify API
async function fetchIpDetails(ip) {
  try {
    if (loader) loader.style.display = "block";
    if (mapContainer) mapContainer.style.display = "none"; // Hide map by default

    const response = await fetch(
      `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=${ip}`
    );

    if (!response.ok) {
      throw new Error("Invalid input or IP not found.");
    }

    const data = await response.json();
    console.log(data);

    // Filling details
    ipField.textContent = data.ip || "N/A";
    locationField.textContent = `${data.location?.city || "N/A"}, ${
      data.location?.region || "N/A"
    }`;
    // timezoneField.textContent = data.location?.timezone || "N/A";
    if (data.location?.timezone) {
      const currentTime = getCurrentTimeInTimezone(data.location.timezone);
      timezoneField.textContent = `${data.location.timezone} (${currentTime})`;
    } else {
      timezoneField.textContent = "N/A";
    }
    ispField.textContent = data.isp || "N/A";

    // Show map container only if location exists
    if (data.location?.lat && data.location?.lng) {
      mapContainer.style.display = "block";

      // Remove previous map instance if exists
      if (map) {
        map.remove();
      }

      // Initialize new map
      map = L.map("map").setView([data.location.lat, data.location.lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Add marker
      L.marker([data.location.lat, data.location.lng]).addTo(map);
    }
  } catch (error) {
    alert(error.message || "Something went wrong.");
  } finally {
    if (loader) loader.style.display = "none";
  }
}
