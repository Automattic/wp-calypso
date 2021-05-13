# Site Title Control

Site Title Control component: Form input controls to set a site's title and tagline.

## `index.jsx`

Renders two `FormTextInput` components to set a site's title and tagline, respectively.

Pass the (current) title and tagline to the Site Title component using the `blogname` and `blogdescription`
props, respectively, and pass an `onChange` function prop (accepting an object with `blogname` and `blogdescription` attributes) to react to a user's changes to either.

For an example of how to use, have a look at [docs/example.jsx](docs/example.jsx).

## Props

- `autoFocusBlogname` - _optional_ (bool) Whether to auto-focus the site title input field (defaults to `false`).
- `blogname` - _optional_ (string) Site title to be displayed in corresponding input field.
- `blogdescription` - _optional_ (string) Site tagline to be displayed in corresponding input field.
- `disabled` - _optional_ (bool) Whether input fields should be disabled (defaults to `false`).
- `isBlognameRequired` - _optional_ (bool) Whether set the blogname field as required
- `onChange` - _optional_ (function) Called whenever user changes either the site title or tagline field. Invoked with an object with `blogname` and `blogdescription` attributes.
