console.log('Content script loaded and initialized');


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    switch (request.action) {
        case 'changeTextSize':
            changeTextSize(request.size);
            sendResponse({ success: true });
            break;
        case 'changeContrast':
            changeContrast(request.contrast);
            sendResponse({ success: true });
            break;
        case 'scroll':
            scrollPage(request.direction);
            sendResponse({ success: true }); 
            break;
        default:
            console.warn('Unknown action received:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
    }
    return true; 
});


function changeTextSize(size) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize);
    const scale = size / currentSize;
    
    root.style.fontSize = `${size}px`;
    
    
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        if (computedStyle.fontSize !== '16px') {
            const currentSize = parseFloat(computedStyle.fontSize);
            element.style.fontSize = `${currentSize * scale}px`;
        }
    });
}


function changeContrast(contrast) {
    const root = document.documentElement;
    root.style.filter = `contrast(${contrast})`;
}


function scrollPage(direction) {
    try {
        console.log('Scroll command received:', direction);
        
        
        if (typeof window === 'undefined') {
            throw new Error('Window object not available');
        }
        
        
        if (typeof window.pageYOffset === 'undefined') {
            throw new Error('PageYOffset not available');
        }
        
        const scrollAmount = 300; 
        const currentScroll = window.pageYOffset;
        console.log('Current scroll position:', currentScroll);
        
        if (direction === 'down') {
            window.scrollTo({
                top: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
            console.log('Scrolling down to:', currentScroll + scrollAmount);
        } else if (direction === 'up') {
            window.scrollTo({
                top: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
            console.log('Scrolling up to:', currentScroll - scrollAmount);
        } else {
            throw new Error(`Invalid scroll direction: ${direction}`);
        }
        
        
        chrome.runtime.sendMessage({
            action: 'scrollComplete',
            direction: direction,
            success: true,
            newPosition: direction === 'down' ? currentScroll + scrollAmount : currentScroll - scrollAmount
        });
    } catch (error) {
        console.error('Scroll error:', error);
        
        chrome.runtime.sendMessage({
            action: 'scrollComplete',
            direction: direction,
            success: false,
            error: error.message,
            details: {
                windowAvailable: typeof window !== 'undefined',
                pageYOffsetAvailable: typeof window !== 'undefined' && typeof window.pageYOffset !== 'undefined',
                currentScroll: typeof window !== 'undefined' ? window.pageYOffset : 'N/A'
            }
        });
    }
} 