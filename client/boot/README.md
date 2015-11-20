Boot
======

This module is where all the client-side magic starts. The core set of application modules that contain the client-side application routes, any additional application bootstrapping occurs, and the page.js router is started triggering the initial route handler.

Boot is responsible for handling a lot of features we want to happen on every page. The major ones are (in roughly chronological order):

- Initializing i18n
- Injecting the i18n mixin to React components
- Adding touch events
- Adding accessibility focus features
- Setting the document title
- Passing layout to all page handlers
- Passing the query and hash objects into the page.js context
- Boot strapping translation strings
- Setting up analytics
- Rendering the main layout template
- Focussing parts of the layout based on the query string
- Handling query strings
- Loading various helpers (olark, keyboard shortcuts, network connection)
- Starting page.js
