# Tailor Customizer

A native Calypso Customizer replacement that purely uses the REST API.

The customizer controls are defined as objects in the config file,
`tailor/controls/config.js`. Each "control" in this terminology defines a
sidebar panel in the customizer as well as all the associated settings it can
change. Top-level controls are automatically listed by default, although
sub-controls will need their parent control to activate them directly (which can
be done by calling the `activateControl` prop).

Each control object *must* have these properties:

- id: A unique ID for the control.
- parentId: (Optional) The ID of a parent control if this is a sub-control.
- title: A string to display for the control.
- componentClass: A React class to use for the control.
- setupFunction: Called when customizer starts.
- updatePreviewFunction: Called when customizations change.
- saveFunction: Called when customizer saves.

## setupFunction

When Tailor is first loaded, it will call the `setupFunction` for each
control. That function must return a Promise. The Promise should be resolved
to an object of initial settings for that control (it doesn't have to
actually be async, but provides a mechanism in case data needs to be
fetched). The settings will all be saved in the `tailor.customizations`
section of the global state which will be passed to each control as it is
rendered.

The `setupFunction` is passed three arguments:

1. An object of all the actions in TailorActions, bound to dispatch.
2. The current global state object.
3. The current siteId.

The componentClass will be turned into a React element when the control is
focused and rendered in the controls panel. When it is rendered, it will be
provided with the following props:

- All the currently set customizations for this component, including those set
  by the `setupFunction` when the customizer first loaded (so they are also
  initial values).
- site: The currently selected Site object.
- onChange: A function that can be called to update the customizations.
- activateControl: A function that can be called to change the currently active
  control by passing it the ID of another control (or null to return to the top
  menu).

## updatePreviewFunction

When the component calls `onChange`, each control's `updatePreviewFunction` will
be called to update the preview iframe to match the data.

The `updatePreviewFunction` will be called with two arguments:

1. The `document` object from the preview frame's DOM.
2. The current customizations object for this control.

## saveFunction

When the Save button is clicked, the `saveFunction` method of each control is
called, passing it two arguments:

1. An object of all the actions in TailorActions, bound to dispatch.
2. The current customizations object for this control.
3. The current siteId.

The `saveFunction` is expected to use the actions to persist that control's
settings from the state.
