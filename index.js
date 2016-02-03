const { viewFor } = require("sdk/view/core");

const tabs = require("sdk/tabs");
const tabs_utils = require("sdk/tabs/utils");
const simple_prefs = require("sdk/simple-prefs");


function setMuted(tab, muted) {
	let browser = tabs_utils.getBrowserForTab(tab);
	if (muted) {
		browser.mute();
		tab.setAttribute("muted", "true");
	} else {
		browser.unmute();
		tab.removeAttribute("muted");
	}
}

function updateInactive() {
	let tabs_arr = tabs_utils.getTabs();
	tabs_arr.filter(tab => {
		let selected = tab.getAttribute("selected");
		let audible = tab.getAttribute("soundplaying") === "true";

		if (simple_prefs.prefs["affectAllWindows"]) {
			return (tab !== viewFor(tabs.activeTab)) && audible;
		} else {
			return !selected && audible;
		}
	}).forEach(tab => setMuted(tab, true));
}

tabs.on("activate", tab => {
	let xul_tab = viewFor(tab);
	setMuted(xul_tab, false);
	updateInactive();
});
simple_prefs.on("affectAllWindows", updateInactive);

updateInactive();
