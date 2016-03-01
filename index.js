const { viewFor } = require("sdk/view/core");

const tabs = require("sdk/tabs");
const tabs_utils = require("sdk/tabs/utils");
const simple_prefs = require("sdk/simple-prefs");

let tab_blacklist = [];

function isBlacklisted(tab) {
	return tab_blacklist.includes(tabs_utils.getTabId(tab));
}

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
	}).forEach(tab => {
		if (!isBlacklisted(tab)) {
			setMuted(tab, true)
		}
	});
}

tabs.on("activate", tab => {
	let xul_tab = viewFor(tab);
	if (!isBlacklisted(xul_tab)) {
		setMuted(xul_tab, false);
	}
	updateInactive();
});
tabs.on("pageshow", tab => updateInactive());
simple_prefs.on("affectAllWindows", updateInactive);

if (simple_prefs.prefs["ignoreUserModifiedTabs"]) {
	function setListener(tab) {
		tab.addEventListener("click", e => {
			let tab = e.target;
			if (tab._overPlayingIcon) {
				let tab_id = tabs_utils.getTabId(tab);
				if (!tab_blacklist.includes(tab_id)) {
					tab_blacklist.push(tab_id);
				}
			}
		});
	}
	// set listeners
	tabs.on("open", tab => setListener(viewFor(tab)));
	tabs_utils.getTabs().forEach(tab => setListener(tab));
}

// init
updateInactive();