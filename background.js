// background.js

browser.runtime.onInstalled.addListener(() => {
    browser.sidebarAction.open();
});

browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.open();
});
