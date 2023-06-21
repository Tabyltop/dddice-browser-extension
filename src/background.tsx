/** @format */
import { HealthMessage } from './schema/health_message';
import { setStorage } from './storage';

const healthMessageByCharacterId: Record<string, HealthMessage> = {};

function sendMessageToAllTabs(message) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      try {
        chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // no-op, they may not be listening
      }
    });
  });
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  console.log('Got message', message);
  if (message.type === 'health') {
    try {
      healthMessageByCharacterId[message.characterId] = message;
      sendMessageToAllTabs(message);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    sendResponse(true);
  } else if (message.type === 'healthRequest') {
    console.log('Got health request', healthMessageByCharacterId);
    for (const characterId in healthMessageByCharacterId) {
      sendMessageToAllTabs(healthMessageByCharacterId[characterId]);
    }
    sendResponse(true);
  } else if (message.type === 'enableCustomConfiguration') {
    console.log('Enabling custom configuration');
    setStorage({
      customConfiguration: {
        ...message.customConfiguration,
        lastUpdated: Date.now(),
      },
    });
    sendResponse(true);
  } else {
    sendResponse(false);
  }
  return true;
});
