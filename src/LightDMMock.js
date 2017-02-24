/**
 * LightDMMock "class"
 *
 * @author Roel Walraven <mail@cytodev.io>
 *
 * A LightDM Mock that is tightly based on the source C code of
 * Antergos' lightdm-webkit2-greeter. Please note that the deprecation errors
 * are intrusive for a reason.
 *
 * Usage:
 *   Include the file in your theme that needs mocking
 *     <script type="text/javascript" src="mock/LightDMMock.js"></script>
 *   Create a new instance of LightDMMock
 *     if(!("lightdm" in window)) {
 *         var LightDMMock = LightDMMock || {};
 *         window.lightdm = new LightDMMock(autofill, timeout, autoGuest);
 *     }
 *
 * @param {boolean} autofill  [wether or not the arrays for users, languages,
 *                             layouts, and sessions need to be filled with mock
 *                             data. I advise to test both to make your theme
 *                             less prone to crashing.]
 * @param {number}  timeout   [Value to use for simulated autologin (this value
 *                             is in seconds).]
 * @param {boolean} autoGuest [Wether or not to simulate automatic guest login.
 *                             This will also enable a guest account
 *                             in lightdm.has_guest_account]
 */
"use strict";

function LightDMMock(autofill, timeout, autoGuest) {
    window.checkForUpdate("v1.0.0");

    // see <https://github.com/Antergos/web-greeter/blob/before-python/src/webkit2-extension.c#L1470-L1504>

    this.authentication_user = null;
    this.autologin_guest     = false;
    this.autologin_timeout   = 0;
    this.autologin_user      = null;
    this.can_hibernate       = false;
    this.can_restart         = false;
    this.can_shutdown        = false;
    this.can_suspend         = false;
    this.default_session     = null;
    this.has_guest_account   = false;
    this.hide_users          = false;
    this.hostname            = null;
    this.in_authentication   = false;
    this.is_authenticated    = false;
    this.language            = null;
    this.languages           = null;
    this.layout              = null;
    this.layouts             = null;
    this.lock_hint           = false;
    this.num_users           = 0;
    this.select_guest_hint   = null;
    this.select_user_hint    = null;
    this.sessions            = null;
    this.users               = null;
    this.default_language    = null; // Deprecated
    this.default_layout      = null; // Deprecated
    this.select_guest        = null; // Deprecated
    this.select_user         = null; // Deprecated
    this.timed_login_delay   = null; // Deprecated
    this.timed_login_user    = null; // Deprecated

    if(typeof autofill === "boolean" && autofill) {
        var me = document.querySelector("script[src$=\"LightDMMock.js\"]");

        if(!(me instanceof HTMLElement))
            return window.console.error("Could not find my script element.");

        var includePath = me.src;

        if(includePath === undefined)
            return window.console.error("Could not find my src attribute.");

        includePath = includePath.substr(0, includePath.lastIndexOf("/"));

        var asyncLoadEnd = function(that) {
            that.default_session = that.sessions[0].name;
            that.language        = that.languages[0].name;
            that.layout          = that.layouts[0].name;
            that.num_users       = that.users.length;

            if(typeof timeout === "number" && timeout > 0) {
                if(typeof autoGuest === "boolean" && autoGuest) {
                    that.autologin_user  = null;
                    that.autologin_guest = autoGuest;
                }

                that.autologin_user    = that.users[0].username;
                that.autologin_timeout = timeout * 1000;

                // @fixme: am I deprecated as well?
                setTimeout(function() {
                    if((typeof autoGuest === "boolean" && autoGuest) || that.autologin_user !== null)
                        window.autologin_timer_expired();
                }.bind(that), that.timed_login_delay);
            }

            for(var i = 0; i <= that.users; i++) {
                that.users[i].logged_in = Boolean(Math.floor(Math.random() * 2));
                that.users[i].session   = that.sessions[Math.floor((Math.random() * that.sessions.length))].name;
            }
        };

        // see <https://github.com/Antergos/web-greeter/blob/before-python/src/webkit2-extension.c#L1437-L1450>
        window.loadJSON(includePath + "/json/users.json", function(that) {
            if(this.status !== 200)
                return window.console.warn("users.json did not load correctly.");

            that.users = JSON.parse(this.responseText);

            if(that.users !== null && that.languages !== null && that.layouts !== null && that.sessions !== null)
                asyncLoadEnd(that);
        }, this, asyncLoadEnd);

        // see <https://github.com/Antergos/web-greeter/blob/before-python/src/webkit2-extension.c#L1452-L1456>
        window.loadJSON(includePath + "/json/languages.json", function(that) {
            if(this.status !== 200)
                return window.console.warn("languages.json did not load correctly.");

            that.languages = JSON.parse(this.responseText);

            if(that.users !== null && that.languages !== null && that.layouts !== null && that.sessions !== null)
                asyncLoadEnd(that);
        }, this, asyncLoadEnd);

        // see <https://github.com/Antergos/web-greeter/blob/before-python/src/webkit2-extension.c#L1458-L1462>
        window.loadJSON(includePath + "/json/layouts.json", function(that) {
            if(this.status !== 200)
                return window.console.warn("layouts.json did not load correctly.");

            that.layouts = JSON.parse(this.responseText);

            if(that.users !== null && that.languages !== null && that.layouts !== null && that.sessions !== null)
                asyncLoadEnd(that);
        }, this, asyncLoadEnd);

        // see <https://github.com/Antergos/web-greeter/blob/before-python/src/webkit2-extension.c#L1464-L1468>
        window.loadJSON(includePath + "/json/sessions.json", function(that) {
            if(this.status !== 200)
                return window.console.warn("sessions.json did not load correctly.");

            that.sessions = JSON.parse(this.responseText);

            if(that.users !== null && that.languages !== null && that.layouts !== null && that.sessions !== null)
                asyncLoadEnd(that);
        }, this, asyncLoadEnd);
    }
}




/**
 * Specifies the username of the user we'd like to start authenticating as.
 * Note that if you call lightdm.authenticate with no argument, LightDM
 * (via PAM) will issue a show_prompt() call to ask for the username. The
 * older function lightdm.start_authentication() has been deprecated.
 *
 * @param  {String} username [username to authenticate]
 */
LightDMMock.prototype.authenticate = function(username) {
    window.logCall("authenticate", arguments);
    window.checkArguments(arguments, 1, ["string"]);

    if(this.in_authentication) {
        window.show_message("Already authenticating " + this.authentication_user, "error");
        return;
    }

    var exists = false;

    for(var i = 0; i <= this.users.length -1; i++) {
        if(this.users[i].username === username)
            exists = true;
    }

    if(!exists) {
        window.show_message("Invalid username", "error");
        return;
    }

    this.authentication_user = username;
    this.in_authentication   = true;

    window.show_prompt("Password:", "password");
};

/**
 * Authenticates as the guest user.
 */
LightDMMock.prototype.authenticate_as_guest = function() {
    window.logCall("authenticate_as_guest", arguments);
    window.checkArguments(arguments, 0, []);

    if(!this.has_guest_account)
        throw new IlligalUsageException("Guest accounts are turned off. Make sure you check the value of 'lightdm.has_guest_account' before calling this function.");

    if(this.in_authentication) {
        window.show_message("Already authenticating" + this.authentication_user, "error");
        return;
    }

    this.authentication_user = "guest";
    this.in_authentication   = true;
};

/**
 * Cancels the authentication of any user currently in the
 * process of authenticating.
 */
LightDMMock.prototype.cancel_authentication = function() {
    window.logCall("cancel_authentication", arguments);
    window.checkArguments(arguments, 0, []);

    this.authentication_user = null;
    this.in_authentication   = false;
};

/**
 * Cancels the authentication of the autologin user. The older function
 * lightdm.cancel_timed_login() has been deprecated.
 */
LightDMMock.prototype.cancel_autologin = function() {
    window.logCall("cancel_autologin", arguments);
    window.checkArguments(arguments, 0, []);

    this.autologin_user    = null;
    this.autologin_guest   = false;
    this.autologin_timeout = 0;
};

/**
 * Returns the value of a named hint provided by LightDM.
 *
 * @param  {String} hint_name [name of the hint to show]
 */
LightDMMock.prototype.get_hint = function(hint_name) {
    window.logCall("get_hint", arguments);
    window.checkArguments(arguments, 1, ["string"]);

    // @fixme: I have no clue how to simulate this...
};

/**
 * Hibernates the system, if the greeter has the authority to do so.
 */
LightDMMock.prototype.hibernate = function() {
    window.logCall("hibernate", arguments);
    window.checkArguments(arguments, 0, []);

    if(!this.can_hibernate)
        throw new IlligalUsageException("LightDM cannot hibernate the system. Make sure you check the value of 'lightdm.can_hibernate' before calling this function.");

    window.alert("System hibernated.");
    document.location.reload(true);
};

/**
 * When LightDM has prompted for input, provide the response to LightDM. The
 * deprecated function was "provide_secret". This is still available for
 * backwards compatibility, but authors of greeters should move
 * to using lightdm.respond().
 *
 * @param {String} text [the response to the challange, usually a password]
 */
LightDMMock.prototype.respond = function(text) {
    window.logCall("respond", arguments);
    window.checkArguments(arguments, 1, ["string"]);

    if(!this.in_authentication)
        throw new IlligalUsageException("LightDM is currently not in the authentication phase. Make sure to call 'lightdm.authenticate(username)' before calling this function.");

    if(text === "password") {
        this.is_authenticated = true;
        window.authentication_complete();
    } else {
        window.show_message("Invalid password", "error");
    }
};

/**
 * Restarts the system, if the greeter has the authority to do so.
 */
LightDMMock.prototype.restart = function() {
    window.logCall("restart", arguments);
    window.checkArguments(arguments, 0, []);

    if(!this.can_restart)
        throw new IlligalUsageException("LightDM cannot restart the system. Make sure you check the value of 'lightdm.can_restart' before calling this function.");

    window.alert("System restarted.");
    document.location.reload(true);
};

/**
 * Will set the language for the current LightDM session.
 *
 * @param {String} lang [the language to change to]
 */
LightDMMock.prototype.set_language = function(lang) {
    window.logCall("set_language", arguments);
    window.checkArguments(arguments, 1, ["string"]);

    this.language = lang;
};

/**
 * Shuts down the system, if the greeter has the authority to do so.
 */
LightDMMock.prototype.shutdown = function() {
    window.logCall("shutdown", arguments);
    window.checkArguments(arguments, 0, []);

    if(!this.can_shutdown)
        throw new IlligalUsageException("LightDM cannot shut down the system. Make sure you check the value of 'lightdm.can_shutdown' before calling this function.");

    window.alert("System shut down.");
    document.location.reload(true);
};

/**
 * Once LightDM has successfully authenticated the user, start the user's
 * session by calling this function. "session" is the authenticated user's
 * session. If no session is passed, start the authenticated user with the
 * system default session. The older function lightdm.login(user, session)
 * has been deprecated.
 *
 * @param  {String} session [the session name to start]
 */
LightDMMock.prototype.start_session = function(session) {
    window.logCall("start_session_sync", arguments);
    window.checkArguments(arguments, 1, ["string"]);

    if(!this.in_authentication)
        throw new IlligalUsageException("LightDM is currently not in the authentication phase. Make sure to call 'lightdm.authenticate(username)' before calling this function.");

    if(!this.is_authenticated)
        throw new IlligalUsageException("LightDM has no authenticated users to log in. Make sure to call 'lightdm.respond()' before calling this function.");

    window.alert("LightDM has started a " + session + " session for " + this.authentication_user);
    document.location.reload(true);
};

/**
 * Suspends the system, if the greeter has the authority to do so.
 */
LightDMMock.prototype.suspend = function() {
    window.logCall("suspend", arguments);
    window.checkArguments(arguments, 0, []);

    if(!this.can_suspend)
        throw new IlligalUsageException("LightDM cannot suspend the system. Make sure you check the value of 'lightdm.can_suspend' before calling this function.");

    window.alert("System suspended.");
    document.location.reload(true);
};


/******************************************************************************
 *                                 Deprecated                                 *
*******************************************************************************/

LightDMMock.prototype.cancel_timed_login = function() {
    window.logCall("cancel_timed_login", arguments);
    window.deprecationNotifier("method", "lightdm.cancel_timed_login()", "lightdm.cancel_autologin()");
};

LightDMMock.prototype.start_authentication = function() {
    window.logCall("start_authentication", arguments);
    window.deprecationNotifier("method", "lightdm.start_authentication()", "lightdm.authenticate(username)");
};

LightDMMock.prototype.login = function() {
    window.logCall("login", arguments);
    window.deprecationNotifier("method", "lightdm.login()", "lightdm.start_session(session)");
};

LightDMMock.prototype.provide_secret = function() {
    window.logCall("provide_secret", arguments);
    window.deprecationNotifier("method", "lightdm.provide_secret(text)", "lightdm.respond(text)");
};

LightDMMock.prototype.start_session_sync = function() {
    window.logCall("login", arguments);
    window.deprecationNotifier("method", "lightdm.start_session_sync(session)", "lightdm.start_session(session)");
};


/******************************************************************************
 *                                 Throwables                                 *
 ******************************************************************************/

/**
 * Throwable IlligalUsageException
 *
 * @param {string} message [description of illigal usage]
 */
function IlligalUsageException(message) {
    this.name     = "IlligalUsageException";
    this.message  = message;
    this.toString = function() {
        return "[" + this.name + "] " + this.message;
    };
}

/**
 * Throwable DeprecationException
 *
 * @param  {String} type        [method||property]
 * @param  {String} depricated  [deprecated method or property name]
 * @param  {String} alternative [alternative method or property to use]
 */
function DeprecationException(type, deprecated, alternative) {
    this.name     = "DeprecationException";
    this.message  = "The " + type + " '" + deprecated + "' is deprecated. Consider using '" + alternative + "' instead.";
    this.toString = function() {
        return "[" + this.name + "] " + this.message;
    };
}

/**
 * Throwable IncompatibleArgumentCountException
 *
 * @param  {Number} expected [expected length of arguments]
 * @param  {Number} received [found length of arguments]
 */
function IncompatibleArgumentCountException(expected, received) {
    this.name     = "IncompatibleArgumentCountException";
    this.message  = "Incorrect number of arguments in function call. Expected " + expected + ", found " + received;
    this.toString = function() {
        return "[" + this.name + "] " + this.message;
    };
}

/**
 * Throwable IncompatibleArgumentTypesException
 *
 * @param  {Number} type     [argument number (non-zero)]
 * @param  {String} expected [expected type]
 * @param  {String} received [found type]
 */
function IncompatibleArgumentTypesException(number, expected, received) {
    this.name     = "IncompatibleArgumentTypesException";
    this.message  = "Argument " + number + " is of a wrong type. Expected '" + expected + "', found '" + received + "'";
    this.toString = function() {
        return "[" + this.name + "] " + this.message;
    };
}


/******************************************************************************
 *                                   Helpers                                  *
*******************************************************************************/

/**
 * global helper deprecationNotifier
 *     throws ~balls~ errors at users who use deprecated methods and properties.
 *
 * @param  {String} type        [method||property]
 * @param  {String} depricated  [deprecated method or property name]
 * @param  {String} alternative [alternative method or property to use]
 *
 * @throws {DeprecationException}
 */
window.deprecationNotifier = function(type, deprecated, alternative) {
    throw new DeprecationException(type, deprecated, alternative);
};

/**
 * global helper checkArguments
 *     throws ~tables~ errors at users who call methods
 *     with erroneous arguments.
 *
 * @param  {Array}  args   [the arguments passed to the original method]
 * @param  {Number} length [the expected amount of arguments]
 * @param  {Arrray} types  [the expected types of the arguments]
 *
 * @throws {IncompatibleArgumentTypesException}
 */
window.checkArguments = function(args, length, types) {
    if(args.length !== length)
        throw new IncompatibleArgumentCountException(length, args.length);

    for(var i = 1; i <= types.length; i++) {
        if(typeof args[i-1] !== types[i-1])
            throw new IncompatibleArgumentTypesException(i, types[i-1], typeof args[i-1]);
    }
};

/**
 * global helper logCall
 *     logs a function call with the arguments provided to help with debugging a
 *     lightdm js script.
 *
 * @param  {String} name [called function name]
 * @param  {Array}  args [called function arguments]
 *
 * @return {window.console.info}
 */
window.logCall = function(name, args) {
    var argv = [];

    if(args !== undefined && args.length !== 0) {
        for(var i = 0; i <= args.length; i++) {
            if(args[i] !== undefined)
                argv.push({type: typeof args[i], value: args[i]});
        }
    }

    if(argv.length > 0)
        return window.console.info("[lightdm." + name + "] called with " + argv.length + " argument(s)", argv);

    return window.console.info("[lightdm." + name + "] called with 0 arguments");
};

/**
 * global helper checkForUpdate
 *     compares curentVersion with the tag name of GitHub's latest release and
 *     prompts the user to download a new version if it is available.
 *
 * @param  {String} currentVersion [the current tag version]
 */
window.checkForUpdate = function(currentVersion) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            switch(request.status) {
                case 200:
                    try {
                        var latest;

                        if(request.responseText !== undefined)
                            latest = JSON.parse(request.responseText).tag_name;

                        if(currentVersion !== latest)
                            window.console.warn("You are using an outdated version of LightDMMock. Please download the new version from https://github.com/CytoDev/LightDMMock/releases/" + latest);
                    } catch(e) {
                        window.console.error(e.toString());
                        window.console.warn("Could not check for new version of LightDMMock. Please check for a new version manually by visiting https://github.com/CytoDev/LightDMMock/releases/latest");
                    }
                    break;
                case 404:
                    window.console.warn("Could not check for new version of LightDMMock. Please check for a new version manually by visiting https://github.com/CytoDev/LightDMMock/releases/latest");
                    break;
                default:
                    break;
            }
        }
    };

    request.open("GET", "https://api.github.com/repos/CytoDev/LightDMMock/releases/latest", true);
    request.send();
};

/**
 * global helper loadJSON
 *     Loads JSON from a path. Removes the need to b64 encode them in this file.
 *
 * @param  {String}   url      [path to JSON file]
 * @param  {Function} callback [callback function]
 */
window.loadJSON = function(url, callback) {
    var request = new XMLHttpRequest();

    var onSuccess = function() {
        this.callback.apply(request, request.arguments);
    };

    var onFailure = function() {
        window.console.error(this.statusText);
    };

    request.callback  = callback;
    request.arguments = Array.prototype.slice.call(arguments, 2);
    request.onload    = onSuccess;
    request.onerror   = onFailure;

    request.open("get", url, true);
    request.send(null);
};


/******************************************************************************
 *                             Object.watch  shim                             *
*******************************************************************************/

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
          enumerable: false,
          configurable: true,
          writable: false,
          value: function(prop, handler) {
            var oldval = this[prop],
            newval = oldval,
            getter = function () {
                return newval;
            },
            setter = function (val) {
                oldval = newval;
                newval = handler.call(this, prop, oldval, val);
                return newval;
            };

            if(delete this[prop]) { // can't watch constants
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    });
}

// object.unwatch
if(!Object.prototype.unwatch) {
    Object.defineProperty(Object.prototype, "unwatch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function (prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        }
    });
}

LightDMMock.watch('default_language', function() {
    window.deprecationNotifier("property", "default_language", "lightdm.language");
});

LightDMMock.watch('default_layout', function() {
    window.deprecationNotifier("property", "default_layout", "lightdm.layout");
});

LightDMMock.watch('select_guest', function() {
    window.deprecationNotifier("property", "select_guest", "lightdm.select_guest_hint");
});

LightDMMock.watch('select_user', function() {
    window.deprecationNotifier("property", "select_user", "lightdm.select_user_hint");
});

LightDMMock.watch('timed_login_user', function() {
    window.deprecationNotifier("property", "timed_login_user", "lightdm.autologin_user");
});

LightDMMock.watch('timed_login_delay', function() {
    window.deprecationNotifier("property", "timed_login_delay", "lightdm.autologin_timeout");
});

if (module) {
    module.exports = LightDMMock;
}
