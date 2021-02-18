# Notices

A subtree of state that manages global notices.
Supported types of notices are `error`, `success`.

## How to use?

### Connect to Redux

First, the component that wants to send notices must be connected to Redux.

```javascript
import { connect } from 'react-redux';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

export default connect( null, { successNotice, errorNotice } )( Component );
```

### Uses

Now you can use notices like so:

```javascript
this.props.successNotice( 'Settings saved successfully!', {
	duration: 4000,
} );
```

### The available methods are

- `successNotice()`
- `errorNotice()`
- `infoNotice()`
- `warningNotice()`

## Options

The first argument is the text to be displayed on the notice. The second argument is an optional object and accepts some properties:

_All these parameters are optional_

- `id` (default generated `uniqueId()` ) ID for your notice
- `duration` (default null - notices stay forever) Duration in milliseconds to display the notice before dismissing.
- `showDismiss` (default true) To indicate if dismiss button should be rendered within the overlay.
- `isPersistent` (default false - notices disappear when navigating route) - should notice be persistent between route changes?
- `displayOnNextPage` (default false) - should notice appear on next route change?
- `button` (default undefined) - Text label to display on action button
- `href` (optional, requires button to be set as well) - Url to be used for the button action.
- `onClick` (optional, requires button to be set as well) - Function to be invoked for the button action.
