document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');
  const toggle = document.getElementById('clickToDetectToggle');
  const stateLabel = document.getElementById('clickToDetectState');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusTitle = document.getElementById('statusTitle');
  const statusDetails = document.getElementById('statusDetails');

  function setState(on) {
    if (toggle) toggle.checked = !!on;
    if (stateLabel) stateLabel.textContent = on ? 'On' : 'Off';
  }

  try {
    chrome.storage.sync.get({ clickToDetect: false }, (items) => {
      setState(!!items.clickToDetect);
    });
  } catch (e) { /* no-op */ }

  if (toggle) {
    toggle.addEventListener('change', () => {
      const val = !!toggle.checked;
      setState(val);
      try {
        chrome.storage.sync.set({ clickToDetect: val }, () => {
          chrome.runtime.sendMessage({ type: 'settingsUpdated', settings: { clickToDetect: val } });
        });
      } catch (e) { /* no-op */ }
    });
  }

  // Show content, hide loader
  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';

  // Health check
  async function refreshHealth() {
    try {
      const res = await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ action: 'checkServerStatus' }, (resp) => resolve(resp));
        } catch (_) { resolve(null); }
      });
      const online = !!(res && res.isRunning);
      if (statusIndicator) {
        statusIndicator.classList.toggle('online', online);
        statusIndicator.classList.toggle('offline', !online);
      }
      if (statusTitle) statusTitle.textContent = online ? 'Server online' : 'Checking server status...';
      if (statusDetails) statusDetails.textContent = online ? 'Connected to detection server' : 'Connecting to detection server';
    } catch (_) {}
  }
  document.getElementById("privacyLink").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("privacyModal").classList.remove("hidden");
});

document.getElementById("closePrivacy").addEventListener("click", () => {
  document.getElementById("privacyModal").classList.add("hidden");
});

// Optional: close modal if background is clicked
document.getElementById("privacyModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add("hidden");
  }
});

  refreshHealth();
  setInterval(refreshHealth, 15000);
});
