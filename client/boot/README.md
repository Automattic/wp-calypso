# Boot

This module is where all the client-side magic starts. The core set of application modules that contain the client-side application routes, any additional application bootstrapping occurs, and the page.js router is started triggering the initial route handler.

## Folder structure

```text
client/boot/
├── app.js
├── common.js
└── polyfills.js
```

There is a single entry point for the Webpack client build: `client/boot/app.js`. It is responsible for handling a lot of features we want to happen on every page.

The major ones are shared between all projects and live in `client/boot/common.js` file. Those are in roughly chronological order:

- Initializing i18n
- Boot strapping translation strings
- Adding touch events
- Adding accessibility focus features
- Initializing and configuring Redux store
- Passing the query and hash objects into the page.js context
- Loading sections
- Setting general purpose middlewares (handlers for oauth, logged out, clear notices, unsaved forms)
- Starting page.js
