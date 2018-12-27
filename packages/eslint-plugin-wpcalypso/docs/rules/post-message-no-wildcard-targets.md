# Always provide a specific targetOrigin, not *

Always provide a specific targetOrigin, not *, if you know where the other window's document should be located.
Failing to provide a specific target discloses the data you send to any interested malicious site.

More information: 
 - [OWASP Web Messaging](https://www.owasp.org/index.php/HTML5_Security_Cheat_Sheet#Web_Messaging)
 - [MDN window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window/postMessage)

## Rule Details

Passing `*` as the second parameter (the target origin) inside of `postMessage` is considered an error for security purposes.

```js
postMessage( JSON.stringify( data ), '*' );
```

Passing a specific target object is not considered a warning or error.

```js
postMessage( JSON.stringify( data ), 'widgets.wp.com' );
```