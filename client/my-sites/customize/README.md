Customizer
==========

This component enables loading, in an iframe, either:

1. Legacy Customizer (for desktop)
2. Muse (for mobile)

### customize.jsx

The React view for rendering the iframe

### message.js

Creates a `postMessage` bridge to the iframe'd customization window to allow closing from inside the iframe to navigate back to the `sites` route.