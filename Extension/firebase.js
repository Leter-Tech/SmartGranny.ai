const firebaseConfig = {
        REMOVED
};


window.firebase = {
    app: null,
    auth: {
        getAuth: function() {
            return {
                currentUser: null,
                onAuthStateChanged: function(callback) {
                    
                    callback(null);
                }
            };
        },
        createUserWithEmailAndPassword: async function(auth, email, password) {
            console.log("Signing up with:", email);
            try {
                
                const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        returnSecureToken: true
                    })
                });
                
                const data = await response.json();
                console.log("Signup response:", data);
                
                
                if (!response.ok) {
                    console.error("Signup error response:", data);
                    
                    if (data && data.error) {
                        const errorCode = data.error.message || 'UNKNOWN_ERROR';
                        const errorMessage = data.error.message || 'An unknown error occurred';
                        throw { 
                            code: `auth/${errorCode}`,
                            message: errorMessage
                        };
                    }
                    throw {
                        code: 'auth/unknown-error',
                        message: 'An unknown error occurred during signup'
                    };
                }
                
                const userData = {
                    email: email,
                    uid: data.localId,
                    token: data.idToken
                };
                
                
                localStorage.setItem('authUser', JSON.stringify(userData));
                
                
                if (this._authStateListeners) {
                    this._authStateListeners.forEach(listener => {
                        listener(userData);
                    });
                }
                
                return { user: { email, uid: data.localId } };
            } catch (error) {
                if (error.code) {
                    
                    throw error;
                }
                
                console.error("Signup network error:", error);
                throw { 
                    code: 'auth/network-error',
                    message: 'Network error. Please check your internet connection and try again.'
                };
            }
        },
        signInWithEmailAndPassword: async function(auth, email, password) {
            console.log("Logging in with:", email);
            try {
                
                const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        returnSecureToken: true
                    })
                });
                
                const data = await response.json();
                console.log("Login response:", data);
                
                
                if (!response.ok) {
                    console.error("Login error response:", data);
                    
                    if (data && data.error) {
                        const errorCode = data.error.message || 'UNKNOWN_ERROR';
                        const errorMessage = data.error.message || 'An unknown error occurred';
                        throw { 
                            code: `auth/${errorCode}`,
                            message: errorMessage
                        };
                    }
                    throw {
                        code: 'auth/unknown-error',
                        message: 'An unknown error occurred during login'
                    };
                }
                
                const userData = {
                    email: email,
                    uid: data.localId,
                    token: data.idToken
                };
                
                
                localStorage.setItem('authUser', JSON.stringify(userData));
                
                
                if (this._authStateListeners) {
                    this._authStateListeners.forEach(listener => {
                        listener(userData);
                    });
                }
                
                return { user: { email, uid: data.localId } };
            } catch (error) {
                if (error.code) {
                    
                    throw error;
                }
                
                console.error("Login network error:", error);
                throw { 
                    code: 'auth/network-error',
                    message: 'Network error. Please check your internet connection and try again.'
                };
            }
        },
        signOut: async function() {
            localStorage.removeItem('authUser');
            
            
            if (this._authStateListeners) {
                this._authStateListeners.forEach(listener => {
                    listener(null);
                });
            }
            
            return Promise.resolve();
        },
        _authStateListeners: [],
        onAuthStateChanged: function(auth, callback) {
            
            if (!this._authStateListeners) {
                this._authStateListeners = [];
            }
            this._authStateListeners.push(callback);
            
            
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setTimeout(function() {
                    callback(user);
                }, 100);
            } else {
                callback(null);
            }
            
            
            return () => {
                this._authStateListeners = this._authStateListeners.filter(listener => listener !== callback);
            };
        }
    },
    database: {
        getDatabase: function() { return { config: firebaseConfig }; },
        ref: function(db, path) { return { path, db }; },
        push: async function(ref, data) {
            try {
                const storedUser = localStorage.getItem('authUser');
                if (!storedUser) throw new Error('Not authenticated');
                
                const user = JSON.parse(storedUser);
                const url = `${firebaseConfig.databaseURL}/${ref.path}.json?auth=${user.token}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const responseData = await response.json();
                return { key: responseData.name };
            } catch (error) {
                console.error("Database push error:", error);
                return { key: Date.now().toString() };
            }
        },
        set: async function(ref, data) {
            try {
                const storedUser = localStorage.getItem('authUser');
                if (!storedUser) throw new Error('Not authenticated');
                
                const user = JSON.parse(storedUser);
                const url = `${firebaseConfig.databaseURL}/${ref.path}.json?auth=${user.token}`;
                
                await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                return Promise.resolve();
            } catch (error) {
                console.error("Database set error:", error);
                return Promise.resolve();
            }
        },
        onValue: function(ref, callback) {
            
            fetchData();
            
            
            const intervalId = setInterval(fetchData, 5000);
            
            async function fetchData() {
                try {
                    const storedUser = localStorage.getItem('authUser');
                    if (!storedUser) {
                        callback({ forEach: function(fn) {} });
                        return;
                    }
                    
                    const user = JSON.parse(storedUser);
                    const url = `${firebaseConfig.databaseURL}/${ref.path}.json?auth=${user.token}`;
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (!data) {
                        callback({ forEach: function(fn) {} });
                        return;
                    }
                    
                    callback({
                        forEach: function(fn) {
                            Object.keys(data).forEach(key => {
                                fn({
                                    key: key,
                                    val: function() {
                                        return data[key];
                                    }
                                });
                            });
                        }
                    });
                } catch (error) {
                    console.error("Database read error:", error);
                    callback({ forEach: function(fn) {} });
                }
            }
            
            return function() {
                clearInterval(intervalId);
            };
        }
    }
}; 