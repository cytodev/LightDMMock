#LightDMMock
A LightDM Mock that is tightly based on the source C code of [Antergos](https://github.com/Antergos)' [lightdm-webkit2-greeter](https://github.com/Antergos/lightdm-webkit2-greeter). <font style="color:red">Please note that the deprecation errors are intrusive for a reason.</font>

##Usage:
 1. Clone the repo
````bash
git clone git@github.com:CytoDev/LightDMMock.git
````
 2. Include the file in your theme that needs mocking<br>
````html
<script type="text/javascript" src="mock/LightDMMock.js"></script>
````
 3. Create a new instance of LightDMMock
````javascript
if(!("lightdm" in window)) {
    var LightDMMock = LightDMMock || {};
    window.lightdm = new LightDMMock(autofill, timeout, autoGuest);
}
````

##Parameters of LightDMMock()
####autofill
> **_`boolean`_**<br>
> Wether or not the arrays for users, languages, layouts, and sessions need to be filled with mock data. I advise to test both to make your theme less prone to crashing.
 ---

####timeout
> **_`number`_**<br>
> Value to use for simulated autologin (this value is in seconds).
 ---

####autoGuest
> **_`boolean`_**<br>
> Wether or not to simulate automatic guest login. This will also enable a guest account in `lightdm.has_guest_account`.
 ---

###A friendly reminder
The following functions __must__ be provided by the custom greeter, which LightDM will call in the process of authenticating the user. This can be found in the original documentation (man pages) of the webkit-greeter, but I have posted them here for your convenience.

> __show\_prompt(text, type)__<br>
> ````
> This will be called when LightDM needs to prompt  the user for some reason, such
> as asking for a password. The "text" parameter will  be the  text of the prompt,
> and  the  "type"  parameter  will  either  be  "text" for a  visible prompt,  or
> "password" for a prompt that the input should be hidden.
> ````
>

> __show\_message(text, type)__<br>
> ````
> This will be called when  LightDM needs to display some info for  the user.  The
> "text" parameter will be  the text of the message, and the "type" parameter will
> either be "info" for  an  information message,  or "error" for  an error message
> that LightDM has encountered.
> ````
>
> __authentication\_complete()__<br>
> ````
> This function is called by LightDM when authentication has completed.
> ````
>
> __autologin\_timer\_expired()__<br>
> ````
> This  function is  called by LightDM when  an autologin user's  login timer  has
> expired. The greeter should reset the authentication process.
> ````

###License:
This project is licensed under the MIT License. You can find a copy of the license [here](https://github.com/CytoDev/LightDMMock/license.md).

###Contributions:
You are more than welcome to submit issues as well as feature requests or just a 'how-ya-doin' in the [issue tracker](https://github.com/CytoDev/LightDMMock/issues/new). Contributing to the project can be done by forking it and submitting a pull request once it's all tested and tidy.
