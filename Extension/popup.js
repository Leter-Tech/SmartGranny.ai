let auth;
let database;

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing Firebase");
    
    try {
        auth = window.firebase.auth.getAuth();
        database = window.firebase.database.getDatabase();
        console.log("Firebase initialized successfully");
        
        
        setupAuthListeners();
        
        
        window.firebase.auth.onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User signed in:", user.email);
                document.getElementById('auth-container').style.display = 'none';
                document.getElementById('main-container').style.display = 'block';
            } else {
                console.log("User signed out");
                document.getElementById('auth-container').style.display = 'block';
                document.getElementById('main-container').style.display = 'none';
            }
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showAuthError("Failed to initialize authentication. Please refresh the page.");
    }
});


const GEMINI_API_KEY = 'REMOVED';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';


const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleAuth = document.getElementById('toggle-auth');
const logoutBtn = document.getElementById('logout-btn');


const chatModal = document.getElementById('chat-modal');
const accessibilityModal = document.getElementById('accessibility-modal');
const scamModal = document.getElementById('scam-modal');
const voiceNavModal = document.getElementById('voice-nav-modal');
const memoriesModal = document.getElementById('memories-modal');
const draftModal = document.getElementById('draft-modal');

function setupAuthListeners() {
    console.log("Setting up auth listeners");
    
    
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            console.log("Login button clicked");
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showAuthError("Please enter both email and password");
                return;
            }

            showAuthLoading(true);
            try {
                await window.firebase.auth.signInWithEmailAndPassword(auth, email, password);
                console.log("Login successful");
                showAuthLoading(false);
            } catch (error) {
                console.error("Login error:", error);
                let errorMessage = "Login failed. Please try again.";
                
                
                if (error.code) {
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/INVALID_LOGIN_CREDENTIALS') {
                        errorMessage = "No account found with this email or incorrect password.";
                    } else if (error.code === 'auth/wrong-password') {
                        errorMessage = "Incorrect password.";
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = "Too many failed login attempts. Please try again later.";
                    } else if (error.code === 'auth/user-disabled') {
                        errorMessage = "This account has been disabled.";
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = "Please enter a valid email address.";
                    } else {
                        
                        errorMessage = error.message || "Login failed. Please try again.";
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showAuthError(errorMessage);
                showAuthLoading(false);
            }
        });
    } else {
        console.error("Login button not found");
    }
    
    
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            console.log("Signup button clicked");
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            if (!email || !password) {
                showAuthError("Please enter both email and password");
                return;
            }
            
            if (password.length < 6) {
                showAuthError("Password should be at least 6 characters");
                return;
            }

            showAuthLoading(true);
            try {
                await window.firebase.auth.createUserWithEmailAndPassword(auth, email, password);
                console.log("Signup successful");
                showAuthLoading(false);
            } catch (error) {
                console.error("Signup error:", error);
                let errorMessage = "Signup failed. Please try again.";
                
                
                if (error.code) {
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = "An account already exists with this email.";
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = "Please enter a valid email address.";
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = "Password is too weak. Use at least 6 characters.";
                    } else if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = "Account creation is disabled at this time.";
                    } else {
                        
                        errorMessage = error.message || "Signup failed. Please try again.";
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showAuthError(errorMessage);
                showAuthLoading(false);
            }
        });
    } else {
        console.error("Signup button not found");
    }
    
    
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener('click', () => {
            console.log("Toggle auth clicked");
            if (loginForm.style.display === 'none') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                toggleAuthBtn.innerHTML = 'Don\'t have an account? <span>Sign up</span>';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                toggleAuthBtn.innerHTML = 'Already have an account? <span>Login</span>';
            }
            
            
            const errorElement = document.getElementById('auth-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    } else {
        console.error("Toggle auth button not found");
    }
    
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await window.firebase.auth.signOut(auth);
                console.log("User signed out");
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    }
}

function showAuthError(message) {
    const errorElement = document.getElementById('auth-error') || createAuthErrorElement();
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.style.display = 'none';
            errorElement.style.opacity = '1';
        }, 300);
    }, 3000);
}

function createAuthErrorElement() {
    const errorElement = document.createElement('div');
    errorElement.id = 'auth-error';
    errorElement.className = 'auth-error';
    document.querySelector('.auth-box').appendChild(errorElement);
    return errorElement;
}

function showAuthLoading(isLoading) {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (isLoading) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loginBtn.disabled = true;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        signupBtn.disabled = true;
    } else {
        loginBtn.innerHTML = 'Login';
        loginBtn.disabled = false;
        signupBtn.innerHTML = 'Sign Up';
        signupBtn.disabled = false;
    }
}


document.getElementById('chat-about').addEventListener('click', () => {
    chatModal.style.display = 'block';
    initializeChat();
});

document.getElementById('accessibility').addEventListener('click', () => {
    accessibilityModal.style.display = 'block';
    initializeAccessibility();
});

document.getElementById('scam-check').addEventListener('click', () => {
    scamModal.style.display = 'block';
    checkScam();
});

document.getElementById('voice-nav').addEventListener('click', () => {
    voiceNavModal.style.display = 'block';
    initializeVoiceNav();
});

document.getElementById('memories').addEventListener('click', () => {
    memoriesModal.style.display = 'block';
    loadMemories();
});

document.getElementById('draft').addEventListener('click', () => {
    draftModal.style.display = 'block';
    initializeDraft();
});


document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});


async function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    let chatHistory = [];
    
    
    chatMessages.innerHTML = '';

    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageContent = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => document.body.innerText
    });

    
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });

    
    const hints = [
        "Summarize this page for me",
        "How do I fill out this form?",
        "What does this page say?",
        "Can you explain this in simpler terms?"
    ];

    hints.forEach(hint => {
        const hintElement = document.createElement('div');
        hintElement.className = 'hint';
        hintElement.textContent = hint;
        hintElement.addEventListener('click', () => {
            sendChatMessage(hint);
        });
        chatMessages.appendChild(hintElement);
    });

    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceInputBtn.style.display = 'none';
    } else {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceInputBtn.addEventListener('click', async () => {
            if (voiceInputBtn.classList.contains('listening')) {
                recognition.stop();
                voiceInputBtn.classList.remove('listening');
                voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-microphone"></i>';
            } else {
                try {
                    
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop()); 
                    
                    recognition.start();
                    voiceInputBtn.classList.add('listening');
                    voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-stop"></i>';
                } catch (error) {
                    console.error('Microphone permission error:', error);
                    alert('Please allow microphone access to use voice input. Click the microphone icon in your browser\'s address bar to enable it.');
                    voiceInputBtn.classList.remove('listening');
                    voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-microphone"></i>';
                }
            }
        });

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            chatInput.value = text;
            voiceInputBtn.classList.remove('listening');
            voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-microphone"></i>';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Please allow microphone access to use voice input. Click the microphone icon in your browser\'s address bar to enable it.');
            }
            voiceInputBtn.classList.remove('listening');
            voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-microphone"></i>';
        };

        recognition.onend = () => {
            if (voiceInputBtn.classList.contains('listening')) {
                voiceInputBtn.classList.remove('listening');
                voiceInputBtn.innerHTML = '<i style="margin: 0px;" class="fas fa-microphone"></i>';
            }
        };
    }

    async function sendChatMessage(message) {
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);
        
        
        const loadingElement = document.createElement('div');
        loadingElement.className = 'ai-message loading';
        loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(loadingElement);
        
        
        chatMessages.scrollTop = chatMessages.scrollHeight;

        
        const requestData = {
            contents: [{
                parts: [
                    { text: `Page Content: ${pageContent[0].result}\n\nUser Message: ${message}\n\nChat History: ${JSON.stringify(chatHistory)}` },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: screenshot.split(',')[1]
                        }
                    }
                ]
            }]
        };

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            
            chatMessages.removeChild(loadingElement);
            
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.textContent = aiResponse;
            chatMessages.appendChild(aiMessage);

            chatHistory.push({ user: message, ai: aiResponse });
            chatInput.value = '';
            
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            
            chatMessages.removeChild(loadingElement);
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'ai-message error';
            errorMessage.textContent = 'Error getting response from AI. Please try again.';
            chatMessages.appendChild(errorMessage);
            
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    sendChatBtn.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            sendChatMessage(message);
        }
    });
    
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                sendChatMessage(message);
            }
        }
    });
}


function initializeAccessibility() {
    const textSizeInput = document.getElementById('text-size');
    const contrastInput = document.getElementById('contrast');

    textSizeInput.addEventListener('input', (e) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'changeTextSize',
                size: e.target.value
            });
        });
    });

    contrastInput.addEventListener('input', (e) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'changeContrast',
                contrast: e.target.value
            });
        });
    });
}


async function checkScam() {
    const scamProgress = document.getElementById('scam-progress');
    const scamPercentage = document.getElementById('scam-percentage');
    const scamDetails = document.getElementById('scam-details');
    
    
    scamProgress.style.width = '50%';
    scamProgress.style.backgroundColor = '#ccc';
    scamPercentage.innerHTML = '<i style="color: #ae2916;" class="fas fa-spinner fa-spin"></i> <span style="color: #ae2916;"> Analyzing...</span>';
    scamDetails.innerHTML = '<div class="loading-message">Analyzing page content and checking for potential scams...</div>';
    
    try {
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log("Got active tab:", tab.url);
        
        
        const pageContentResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText
        });
        
        
        if (!pageContentResult || !pageContentResult[0] || typeof pageContentResult[0].result !== 'string') {
            console.error("Failed to get page content:", pageContentResult);
            throw new Error("Could not extract page content");
        }
        
        const pageContent = pageContentResult[0].result.substring(0, 15000); 
        console.log("Got page content, length:", pageContent.length);
        
        
        const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
        console.log("Got screenshot");
        
        
        const requestData = {
            contents: [{
                parts: [
                    { text: `Analyze this page content and determine if it's a scam. Provide a percentage (0-100) indicating scam likelihood and detailed explanation.\n\nPage Content: ${pageContent}` },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: screenshot.split(',')[1]
                        }
                    }
                ]
            }]
        };

        console.log("Sending request to Gemini API");
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", response.status, errorText);
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Got response from Gemini API");
        
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            console.error("Invalid response format from Gemini API:", data);
            throw new Error("Invalid response from API");
        }
        
        const result = data.candidates[0].content.parts[0].text;
        console.log("Parsed result from API");
        
        
        const percentageMatch = result.match(/(\d+)%/);
        const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 50;
        console.log("Extracted percentage:", percentage);
        
        
        scamProgress.style.width = `${percentage}%`;
        
        
        if (percentage < 40) {
            scamProgress.style.backgroundColor = '#4CAF50'; 
            scamPercentage.style.color = '#4CAF50';
        } else {
            scamProgress.style.backgroundColor = '#f44336'; 
            scamPercentage.style.color = '#f44336';
        }
        
        
        scamPercentage.textContent = `${percentage}% Scam Likelihood`;
        scamDetails.innerHTML = formatScamDetails(result);
    } catch (error) {
        console.error('Scam check error:', error);
        scamProgress.style.width = '0%';
        scamProgress.style.backgroundColor = '#ccc';
        scamPercentage.textContent = 'Error';
        scamPercentage.style.color = '#f44336';
        scamDetails.innerHTML = `<div class="error-message">Error checking for scam: ${error.message || 'Unknown error'}. Please try again.</div>`;
    }
}

function formatScamDetails(text) {
    
    text = text.replace(/\b(\d+)%\s+Scam\s+Likelihood\b/gi, '');
    text = text.replace(/\bScam\s+Likelihood:\s*(\d+)%\b/gi, '');
    
    
    const lines = text.split('\n');
    let formattedHtml = '<div class="scam-analysis">';
    
    let currentListType = null; 
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        
        if (line.match(/^\d+%$/) || line.match(/^scam likelihood:?\s*\d+%$/i)) continue;
        
        if (line.toLowerCase().includes('reasons') || 
            line.toLowerCase().includes('indicators') || 
            line.toLowerCase().includes('conclusion') || 
            line.toLowerCase().includes('summary') ||
            line.toLowerCase().includes('analysis')) {
            
            if (currentListType) {
                formattedHtml += `</${currentListType}>`;
                currentListType = null;
            }
            
            formattedHtml += `<h4>${line}</h4>`;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            
            if (!currentListType) {
                formattedHtml += '<ul>';
                currentListType = 'ul';
            }
            formattedHtml += `<li>${line.substring(2)}</li>`;
        } else if (line.match(/^\d+\./)) {
            
            if (!currentListType) {
                formattedHtml += '<ol>';
                currentListType = 'ol';
            }
            formattedHtml += `<li>${line.substring(line.indexOf('.')+1).trim()}</li>`;
        } else {
            
            if (currentListType) {
                formattedHtml += `</${currentListType}>`;
                currentListType = null;
            }
            
            formattedHtml += `<p>${line}</p>`;
        }
    }
    
    
    if (currentListType) {
        formattedHtml += `</${currentListType}>`;
    }
    
    formattedHtml += '</div>';
    return formattedHtml;
}


function initializeVoiceNav() {
    const startVoiceBtn = document.getElementById('start-voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    let finalTranscript = '';
    
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceStatus.textContent = 'Speech recognition is not supported in this browser';
        startVoiceBtn.disabled = true;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;  
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    startVoiceBtn.addEventListener('click', async () => {
        if (startVoiceBtn.classList.contains('listening')) {
            
            recognition.stop();
            startVoiceBtn.classList.remove('listening');
            startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
            
            
            if (finalTranscript) {
                processVoiceCommand(finalTranscript);
            }
            
            
            finalTranscript = '';
        } else {
            try {
                
                finalTranscript = '';
                
                
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop()); 
                
                recognition.start();
                startVoiceBtn.classList.add('listening');
                startVoiceBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
                voiceStatus.textContent = 'Listening...';
            } catch (error) {
                console.error('Microphone permission error:', error);
                voiceStatus.textContent = 'Please allow microphone access to use voice navigation';
                alert('Please allow microphone access to use voice navigation. Click the microphone icon in your browser\'s address bar to enable it.');
                startVoiceBtn.classList.remove('listening');
                startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
            }
        }
    });

    recognition.onresult = (event) => {
        
        const interimTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
            
        
        voiceStatus.textContent = `Hearing: ${interimTranscript}`;
        
        
        if (event.results[0].isFinal) {
            finalTranscript = interimTranscript.toLowerCase();
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            voiceStatus.textContent = 'Please allow microphone access to use voice navigation';
            alert('Please allow microphone access to use voice navigation. Click the microphone icon in your browser\'s address bar to enable it.');
        } else {
            voiceStatus.textContent = `Error: ${event.error}`;
        }
        startVoiceBtn.classList.remove('listening');
        startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
    };

    recognition.onend = () => {
        if (startVoiceBtn.classList.contains('listening')) {
            
            if (finalTranscript) {
                processVoiceCommand(finalTranscript);
                finalTranscript = '';
            }
            
            
            recognition.start();
        }
    };

    async function processVoiceCommand(command) {
        console.log('Processing command:', command);
        
        if (command.includes('scroll')) {
            voiceStatus.textContent = `Command: ${command}`;
            
            
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (tabs[0]) {
                    try {
                        
                        const responseListener = (message, sender, sendResponse) => {
                            if (message.action === 'scrollComplete') {
                                chrome.runtime.onMessage.removeListener(responseListener);
                                if (message.success) {
                                    voiceStatus.textContent = `Scrolled ${command.includes('down') ? 'down' : 'up'} to position ${message.newPosition}`;
                                    setTimeout(() => {
                                        if (voiceStatus.textContent.includes('Scrolled')) {
                                            voiceStatus.textContent = '';
                                        }
                                    }, 2000);
                                } else {
                                    
                                    const errorDetails = message.details ? 
                                        `\nWindow available: ${message.details.windowAvailable}\n` +
                                        `PageYOffset available: ${message.details.pageYOffsetAvailable}\n` +
                                        `Current scroll: ${message.details.currentScroll}` : '';
                                    
                                    voiceStatus.textContent = `Error: ${message.error}${errorDetails}`;
                                    console.error('Scroll error details:', message);
                                    setTimeout(() => {
                                        if (voiceStatus.textContent.includes('Error')) {
                                            voiceStatus.textContent = '';
                                        }
                                    }, 5000); 
                                }
                            }
                        };
                        chrome.runtime.onMessage.addListener(responseListener);

                        
                        await chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'scroll',
                            direction: command.includes('down') ? 'down' : 'up'
                        });
                    } catch (error) {
                        console.error('Error sending scroll command:', error);
                        voiceStatus.textContent = `Error: ${error.message || 'Could not send scroll command'}`;
                        setTimeout(() => {
                            if (voiceStatus.textContent.includes('Error')) {
                                voiceStatus.textContent = '';
                            }
                        }, 5000); 
                    }
                } else {
                    voiceStatus.textContent = 'Error: No active tab found';
                    setTimeout(() => {
                        if (voiceStatus.textContent.includes('Error')) {
                            voiceStatus.textContent = '';
                        }
                    }, 5000); 
                }
            });
        } else if (command.includes('open')) {
            
            voiceStatus.textContent = `Finding link for: ${command}...`;
            
            const requestData = {
                contents: [{
                    parts: [{ 
                        text: `Extract the direct website URL for: ${command}. Only respond with the URL, nothing else. If it's a website, add https:// if missing. For example, if the command is "open gmail", respond with "https://gmail.com". Do not give urls that start with https://www.google.com/search Give only URLs not google searches. If user asks a genre of website give them any relevant website. Do not return without a URL` 
                    }]
                }]
            };

            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();
                let url = data.candidates[0].content.parts[0].text.trim();
                
                
                url = url.replace(/^["']|["']$/g, ''); 
                
                
                if (url.toUpperCase() === 'SEARCH') {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
                    voiceStatus.textContent = `Searching for: ${command}`;
                    chrome.tabs.create({ url: searchUrl });
                    return;
                }
                
                
                if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }
                
                
                try {
                    new URL(url);
                    voiceStatus.textContent = `Opening: ${url}`;
                    chrome.tabs.create({ url });
                } catch (e) {
                    
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
                    voiceStatus.textContent = `Searching for: ${command}`;
                    chrome.tabs.create({ url: searchUrl });
                }
            } catch (error) {
                console.error('Error:', error);
                
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
                voiceStatus.textContent = `Searching for: ${command}`;
                chrome.tabs.create({ url: searchUrl });
            }
        } else {
            voiceStatus.textContent = `Command not recognized: ${command}`;
            setTimeout(() => {
                if (voiceStatus.textContent.includes('not recognized')) {
                    voiceStatus.textContent = '';
                }
            }, 3000);
        }
    }
}


function loadMemories() {
    const memoriesList = document.getElementById('memories-list');
    const memorizePageBtn = document.getElementById('memorize-page-btn');
    const addMemoryBtn = document.getElementById('add-memory-btn');
    
    
    memoriesList.innerHTML = '';
    
    
    memoriesList.innerHTML += `
        <div class="memories-section">
            <h3>Page Memories</h3>
            <div id="page-memories"></div>
        </div>
        <div class="memories-section">
            <h3>Personal Memories</h3>
            <div id="personal-memories"></div>
        </div>
    `;

    
    try {
        console.log("Loading memories from storage...");
        const pageMemories = JSON.parse(localStorage.getItem('page_memories') || '[]');
        const personalMemories = JSON.parse(localStorage.getItem('personal_memories') || '[]');
        
        const pageMemoriesDiv = document.getElementById('page-memories');
        const personalMemoriesDiv = document.getElementById('personal-memories');
        
        if (!pageMemoriesDiv || !personalMemoriesDiv) {
            console.error("Could not find memory containers in DOM");
            return;
        }
        
        
        if (pageMemories.length === 0) {
            pageMemoriesDiv.innerHTML = '<p>No page memories saved yet.</p>';
        } else {
            pageMemories.forEach((memory) => {
                const memoryElement = document.createElement('div');
                memoryElement.className = 'memory-item';
                memoryElement.innerHTML = `
                    <h4>${memory.title || 'Untitled'}</h4>
                    <p>${memory.content || 'No content'}</p>
                    <button class="open-page-btn" data-url="${memory.url || '#'}">
                        <i class="fas fa-external-link-alt"></i> Open Page
                    </button>
                `;
                pageMemoriesDiv.appendChild(memoryElement);
            });
        }

        
        if (personalMemories.length === 0) {
            personalMemoriesDiv.innerHTML = '<p>No personal memories saved yet.</p>';
        } else {
            personalMemories.forEach((memory) => {
                const memoryElement = document.createElement('div');
                memoryElement.className = 'memory-item';
                memoryElement.innerHTML = `
                    <h4>${memory.title || 'Untitled'}</h4>
                    <p>${memory.content || 'No content'}</p>
                `;
                personalMemoriesDiv.appendChild(memoryElement);
            });
        }

        
        document.querySelectorAll('.open-page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                if (url && url !== '#') {
                    chrome.tabs.create({ url });
                }
            });
        });
    } catch (error) {
        console.error(`Error loading memories: ${error.message}`);
    }

    
    memorizePageBtn.addEventListener('click', async () => {
        try {
            console.log("Starting page memorization...");
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error("Could not get active tab");
            }
            console.log(`Got active tab: ${tab.url}`);

            
            const pageMemoriesDiv = document.getElementById('page-memories');
            pageMemoriesDiv.innerHTML = '<div class="memory-loading"><i class="fas fa-spinner"></i> Memorizing page...</div>';

            
            const pageContentResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => document.body.innerText
            });

            if (!pageContentResult || !pageContentResult[0] || typeof pageContentResult[0].result !== 'string') {
                throw new Error("Could not extract page content");
            }

            const pageContent = pageContentResult[0].result.substring(0, 15000);
            console.log(`Got page content, length: ${pageContent.length}`);

            
            const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
            console.log("Got screenshot");

            
            const requestData = {
                contents: [{
                    parts: [
                        { text: `Create a memory of this page with the following format:
Title: [A concise title summarizing the page]
Memory: [A brief description of what this page contains]

Page Content: ${pageContent}` },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: screenshot.split(',')[1]
                            }
                        }
                    ]
                }]
            };

            console.log("Sending request to Gemini API");
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("Got response from Gemini API");

            if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
                throw new Error("Invalid response from API");
            }

            const result = data.candidates[0].content.parts[0].text;
            console.log("Parsed result from API:", result);

            
            let title, content;
            
            
            const titleMatch = result.match(/Title:\s*(.+?)(?=\n|$)/i);
            const memoryMatch = result.match(/Memory:\s*(.+?)(?=\n|$)/i);
            
            if (titleMatch && memoryMatch) {
                title = titleMatch[1].trim();
                content = memoryMatch[1].trim();
            } 
            
            else {
                const lines = result.split('\n').filter(line => line.trim() !== '');
                if (lines.length >= 1) {
                    title = lines[0].replace(/^Title:\s*/i, '').trim();
                    content = lines.length > 1 ? lines.slice(1).join('\n').replace(/^Memory:\s*/i, '').trim() : 'No content provided';
                } else {
                    title = "Memory of " + tab.title;
                    content = result.trim() || "No content provided";
                }
            }

            
            console.log("Saving memory to storage...");
            const pageMemories = JSON.parse(localStorage.getItem('page_memories') || '[]');
            pageMemories.push({
                title,
                content,
                url: tab.url,
                timestamp: Date.now()
            });
            localStorage.setItem('page_memories', JSON.stringify(pageMemories));

            console.log("Memory saved successfully");
            loadMemories(); 
        } catch (error) {
            console.error(`Error saving page memory: ${error.message}`);
            const pageMemoriesDiv = document.getElementById('page-memories');
            pageMemoriesDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        }
    });

    
    addMemoryBtn.addEventListener('click', () => {
        
        const existingModal = document.querySelector('.memory-modal');
        if (existingModal) {
            existingModal.remove();
        }

        
        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.style.opacity = '0';
        modal.innerHTML = `
            <div class="memory-modal-content">
                <span class="close-btn">&times;</span>
                <h3>Add New Memory</h3>
                <div class="form-group">
                    <label for="memory-title">Title:</label>
                    <input type="text" id="memory-title" placeholder="Enter memory title">
                </div>
                <div class="form-group">
                    <label for="memory-content">Memory:</label>
                    <textarea id="memory-content" placeholder="Enter your memory"></textarea>
                </div>
                <button id="save-memory-btn">Save Memory</button>
            </div>
        `;

        document.body.appendChild(modal);
        
        
        setTimeout(() => {
            modal.style.display = 'block';
            modal.style.opacity = '1';
        }, 50);

        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
            }, 300);
        });

        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });

        
        modal.querySelector('#save-memory-btn').addEventListener('click', async () => {
            const title = modal.querySelector('#memory-title').value.trim();
            const content = modal.querySelector('#memory-content').value.trim();

            if (!title || !content) {
                alert("Please fill in both title and memory content");
                return;
            }

            try {
                console.log("Saving personal memory to storage...");
                const personalMemories = JSON.parse(localStorage.getItem('personal_memories') || '[]');
                personalMemories.push({
                    title,
                    content,
                    timestamp: Date.now()
                });
                localStorage.setItem('personal_memories', JSON.stringify(personalMemories));

                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                    loadMemories(); 
                }, 300);
                console.log("Personal memory saved successfully");
            } catch (error) {
                console.error(`Error saving personal memory: ${error.message}`);
                alert(`Error saving memory: ${error.message}`);
            }
        });
    });
}


function initializeDraft() {
    const draftResponseBtn = document.getElementById('draft-response-btn');
    const draftNewBtn = document.getElementById('draft-new-btn');
    const draftInput = document.getElementById('draft-input');
    const draftDetails = document.getElementById('draft-details');
    const generateDraftBtn = document.getElementById('generate-draft-btn');
    const draftResult = document.getElementById('draft-result');

    draftResponseBtn.addEventListener('click', async () => {
        
        draftResult.innerHTML = '<div class="loading-message">Generating draft <div style="margin-left: 5px;" class="loading-dots"><span></span><span></span><span></span></div></div>';
        draftResult.classList.add('visible');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const pageContent = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText
        });

        const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });

        const requestData = {
            contents: [{
                parts: [
                    { text: `Draft a response for this page content:\n\n${pageContent[0].result}` },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: screenshot.split(',')[1]
                        }
                    }
                ]
            }]
        };

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            draftResult.textContent = data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error:', error);
            draftResult.innerHTML = '<div class="error-message">Error generating draft. Please try again.</div>';
        }
    });

    draftNewBtn.addEventListener('click', () => {
        draftInput.style.display = 'block';
        draftResult.textContent = '';
        draftResult.classList.add('visible');
    });

    generateDraftBtn.addEventListener('click', async () => {
        const details = draftDetails.value.trim();
        if (details) {
            
            draftResult.innerHTML = '<div class="loading-message">Generating draft <div style="margin-left: 5px;" class="loading-dots"><span></span><span></span><span></span></div></div>';
            draftResult.classList.add('visible');
            
            const requestData = {
                contents: [{
                    parts: [{ text: `Draft a message based on these details:\n\n${details}` }]
                }]
            };

            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();
                draftResult.textContent = data.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('Error:', error);
                draftResult.innerHTML = '<div class="error-message">Error generating draft. Please try again.</div>';
            }
        }
    });
} 