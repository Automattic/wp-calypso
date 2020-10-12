# My Sites

This area handles the views and routing logic for the _My Sites_ section in Calyspo. It also provides the directory structure that contains all sub-sections and components related to site management. On the root of this directory there should only be an `index.js` and a `controller.js` file. (That is, in addition to the README.md file we put in all module directories.) Different sub-sections have their own controller file and `main.jsx` component to initialize their render tree.

This organization approach allows us to encapsulate modules under sensible groupings, giving developers a clearer sense of place. Any UI component can be reused, like we use `my-sites/site` in many places.

## Adding a new section

When creating a new section module it should typically look like this:

```
/section
├── index.js
├── controller.js
├── main.jsx
├── README.md
├── ... // components relevant to the section
```

All primary routes should be expressed in `index.js` and the handlers for the various routes should be in `controller.js`. The controller is responsible for mounting any top-level components, handling any core data logic, and/or modifying the state of a component.

The first component that is rendered for any section in `#primary` should be called `section/main.jsx`. That component should make use of `components/main` for it's wrapper.

## Shared modules

If you are creating a shared individual component directly related to the My Sites area of Calypso, the root of `client/my-sites` may be appropiatte for placement — with its own self-documented README.md file of course!
