# Tailor Customizer

A native Calypso Customizer replacement that purely uses the REST API.

## How it works

There are two ways to activate the customizer right now.

1. By clicking the 'Customize' button next to the 'Themes' link in the Calypso sidebar for your site.
2. By visiting `/tailor` or `/tailor/MY_SITE_ID`.

## From within Calypso

The customizer is actually two components that are available any time in Calypso
by setting the `layoutFocus` to `design`. This will hide the rest of the Calypso
interface and display the `DesignMenu` component in the sidebar and the
`WebPreview` component in the main area.

In this mode, you never actually leave the route you are on. The customizer acts
as a modal that is dismissed when you are done customizing.

## From a direct URL

When visiting the URL directly, the `Tailor` component is loaded, which simply
sets the `layoutFocus` to `design` as above.

## DesignMenu

The `DesignMenu` component defines a sidebar that displays one design tool at a
time. A design tool can be any component that will fit in the sidebar. It is
typically either a set of controls to change the site preview or a menu leading
to other design tools.

The currently displayed design tool is identified by a special ID in the Redux
store under `tailor.activeControl`. If that value is not set (or a component
matching the ID is not found), it will display the default design tool which is
a list of all the design tools without a parentId.

All design tools must be registered in the `design-tools.js` file. Each one must
have a unique ID (used for many things as will be explained below), a `title`,
and a `componentClass` which is a raw React component that will display the
panel when rendered.

Optionally, a design tool can have a `parentId`, referring to another design
tool. In that case, the design tool will not be listed by default, and if the
user presses the `back` button while that component is active, the component in
the `parentId` will become the active design tool.

## Design Tool Components

Each design tool's `componentClass` refers to a React component which will be
rendered when that class is active. An active class will be provided with the
following props. It can also get additional props by using `connect` from
`react-redux`.

- activateControl: A function that can be called to change the currently active
  control by passing it the ID of another control (or null to return to the top
  menu).
- onChange: A function that can be called to update the customizations.

## Customizations

Design tools should make changes by calling `onChange` and passing an object.
That object will be merged with the current value of `tailor.customizations` in
the Redux state tree. The objet passed to `onChange` will actually be saved
under `tailor.customizations[ designToolId ]` where `designToolId` is the ID of
the tool from the `design-tools.js` file.

The `customizations` object is used to update the preview and to persist changes
to the API as will be explained below.

## Preview

The `WebPreview` component is used to display a preview of the current site. It
will also be provided with the current value of `tailor.customizations`. If set,
that object will be passed through a series of functions to update the DOM of
the preview iframe to match the customizations.

The functions to update the preview are in `lib/web-preview/index.js` in the
array `updaterFunctions`. It's a good idea to make one function for each setting
change. Each function receives two arguments:

1. The `document` object from the preview iframe's DOM.
2. The current customizations object.

# Saving Changes

To save changes, trigger the action `saveCustomizations` from
`design-menu/actions.js`. That will call a series of functions to persist the
customization data to the REST API.

The code expects one function to be defined matching each key in
`tailor.customizations`. The functions are defined in
`design-menu/save-functions/index.js` and each receives three arguments:

1. The Redux dispatcher.
2. The current customizations object for this ID.
3. The current siteId.
