const { viewFor } = require("sdk/view/core");

const tabs = require("sdk/tabs");
const tabs_utils = require("sdk/tabs/utils");
const simple_prefs = require("sdk/simple-prefs");

const tab_blacklist = [];

function isBlacklisted(tab) {
	return tab_blacklist.includes(tabs_utils.getTabId(tab));
}

function setMuted(tab, muted) {
	const browser = tabs_utils.getBrowserForTab(tab);

	if (isBlacklisted(tab)) {
		return;
	}

	if (muted) {
		browser.mute();
		tab.setAttribute("muted", "true");
	} else {
		browser.unmute();
		tab.removeAttribute("muted");
	}
}

function updateInactive() {
	const tabs_arr = tabs_utils.getTabs();
	tabs_arr.filter(tab => {
		const selected = tab.getAttribute("selected");
		const audible = tab.getAttribute("soundplaying") === "true";

		return simple_prefs.prefs["affectAllWindows"]
			? (tab !== viewFor(tabs.activeTab)) && audible
			: !selected && audible;

	}).forEach(tab => setMuted(tab, true));
}


tabs.on("activate", tab => {
	setMuted(viewFor(tab), false);
	updateInactive();
});

tabs.on("pageshow", tab => updateInactive());
simple_prefs.on("affectAllWindows", updateInactive);


if (simple_prefs.prefs["ignoreUserModifiedTabs"]) {
	function setListener(tab) {
		tab.addEventListener("click", e => {
			const tab = e.target;

			if (!tab._overPlayingIcon) {
				return;
			}

			const tab_id = tabs_utils.getTabId(tab);
			if (!tab_blacklist.includes(tab_id)) {
				tab_blacklist.push(tab_id);
			}
		});
	}
	// set listeners
	tabs.on("open", tab => setListener(viewFor(tab)));
	tabs_utils.getTabs().forEach(tab => setListener(tab));
}

// init
updateInactive();
