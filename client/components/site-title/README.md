Site Title Control
==================

Site Title Control component: Form input controls to set a site's title and tagline.

### `index.jsx`

Renders a modal two `FormTextInput` components to set a site's title and tagline, respectively.

Pass the (current) title and tagline to the Site Title component using the `blogname` and `blogdescription`
props, respectively, and pass an `onChange` function prop (accepting an object with `blogname` and `blogdescription` attributes) to react to a user's changes to either.
