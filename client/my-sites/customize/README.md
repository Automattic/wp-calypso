Customizer
==========

This component enables loading, in an iframe, the Legacy Customizer

### customize.jsx

The React view for rendering the iframe

### message.js

Creates a `postMessage` bridge to the iframe'd customization window to allow closing from inside the iframe to navigate back to the `sites` route.
