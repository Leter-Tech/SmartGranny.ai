
chrome.runtime.onInstalled.addListener(() => {
    console.log('SmartGranny.ai extension installed');
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'scrollComplete') {
        console.log('Scroll completed:', request.direction);
        
    }
    
    
    sendResponse({ success: true });
    return true; 
});


async function ensureContentScriptInjected(tabId) {
    try {
        
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return window.hasOwnProperty('chrome') && chrome.runtime && chrome.runtime.id;
            }
        });
        
        if (!results[0].result) {
            
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            console.log('Content script injected successfully');
        }
    } catch (error) {
        console.error('Error ensuring content script:', error);
    }
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        ensureContentScriptInjected(tabId);
    }
}); 