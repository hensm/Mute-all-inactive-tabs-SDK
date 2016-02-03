const { viewFor } = require("sdk/view/core");

const tabs = require("sdk/tabs");
const tabs_utils = require("sdk/tabs/utils");
const window_utils = require("sdk/window/utils");
const simple_prefs = require("sdk/simple-prefs");

function tabFilter(tab) {
	return (simple_prefs.prefs["affectAllWindows"]
			? (tab !== viewFor(tabs.activeTab))
			: (!tab.selected)) && (tab.getAttribute("soundplaying") === "true");
}


function setMuted(tab, muted) {
	if ((muted && tab.getAttribute("muted") !== "true")
			|| (!muted && tab.getAttribute("muted") === "true")) {
		tab.toggleMuteAudio();
	}
}

function updateInactive() {
	let tabs_arr = tabs_utils.getTabs();
	tabs_arr.filter(tabFilter).forEach(tab => setMuted(tab, true));
}

tabs.on("activate", tab => {
	let xul_tab = viewFor(tab);
	setMuted(xul_tab, false);
	updateInactive();
});
simple_prefs.on("affectAllWindows", updateInactive);

updateInactive();
