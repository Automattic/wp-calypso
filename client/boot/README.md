Boot
======

This module is where all the client-side magic starts. The core set of application modules that contain the client-side application routes, any additional application bootstrapping occurs, and the page.js router is started triggering the initial route handler.

### Folder structure

```text
client/boot/
├── app.js
├── common.js
├── dev-modules.js
└── project/
    └── wordpress-com.js
```

There is a single entry point for the Webpack client build: `client/boot/app.js`. It is responsible for handling a lot of features we want to happen on every page.

The major ones are shared between all projects and live in `client/boot/common.js` file. Those are in roughly chronological order:

- Initializing i18n
- Injecting the i18n mixin to React components
- Boot strapping translation strings
- Loading development utils _*_
- Adding touch events
- Adding accessibility focus features
- Initializing and configuring Redux store
- Passing the query and hash objects into the page.js context
- Loading sections
- Setting general purpose middlewares (handlers for oauth, logged out, clear notices, unsaved forms)
- Starting page.js

_*_ All development tools are now located in `client/boot/dev-modules.js` file and are guarded with environment check to make sure they are never bundled into production builds.

All remaining handlers remain in the project specific file `client/boot/project/${ projectName }.js`. This open possibilities to create custom configurations tailored to particular projects.
Example of project (`WordPress.com`) specific features (see `client/boot/project/wordpress-com.js`):
- Setting the document title
- Passing layout to all page handlers
- Setting up analytics
- Rendering the main layout template
- Focussing parts of the layout based on the query string
- Handling query strings
- Loading various helpers (olark, keyboard shortcuts)

### Project specific API

Each project is capable of hooking in its own custom functionality. It is possible by implementing any of the following API methods:

* `locales( currentUser )`
* `utils()`
* `configureReduxStore( currentUser, reduxStore )`
* `setupMiddlewares( currentUser, reduxStore )`

They are all optional and they may be exported from the project file. Each provide function is executed just after its corresponding shared method with the same signature.
