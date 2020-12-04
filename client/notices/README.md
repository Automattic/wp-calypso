# Notices

Provides some helper functions to render a notice on the UI. Types of notices are `error`, `success`, `info`, and `warning`.

## How to use?

Once you require the component you have access to .

```javascript
import notices from 'calypso/notices';

// Success notice when saving settings
notices.success( 'Settings saved successfully!', { overlay: true } );
```

Notices are all dismissible by the user. The available methods are:

- `notices.success()`
- `notices.error()`
- `notices.info()`
- `notices.warning()`

## Options

The first argument is the text to be displayed on the notice. The second argument is an optional object and accepts some properties:

- `overlay: true`: (optional) To indicate the notice should be rendered within the overlay.
- `button: 'Label'`: (optional) Text label to display on action button.
- `href: 'https://wordpress.com'`: (optional, requires `button` to be set as well) Url to be used for the button action.
- `onClick: function() {}`: (optional, requires `button` to be set as well) Function to be invoked for the button action.
- `duration: 5000`: (optional) Duration in milliseconds to display the notice before dismissing.
- `isCompact: true`: (optional) Applies the `is-compact` class (and related styles) to the notice. Makes the notice smaller and more compact.
- `displayOnNextPage: true`: (optional) Displays the notice on the next page load rather than this one. Useful for showing a notice after a redirect.
- `showDismiss: false`: (optional) To indicate if dismiss button should be rendered within the overlay.
- `persistent: true`: (optional) When set to true it won't be removed from the page when navigating to the next page.

### onClick

The arguments passed to the `onClick` handler are `( event, closeFunction )`, where:

- `event` is the click event caught
- `closeFunction` is a zero-argument function that the handler may call that closes the notice
