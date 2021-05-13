# Masterbar

The Masterbar used across all of WordPress.com is based on this component. If
changes are made to the Masterbar here, they should probably also be reflected
there.

These components should not be called directly. They are managed by the main
layout components.

## masterbar.jsx

This is the masterbar skeleton header and styling, used by logged-out.jsx and
logged-in.jsx respectively, which pass their items as children to this component.

## logged-out.jsx

Renders a logged-out masterbar with only a "Wordpress.com" link.

## logged-in.jsx

Renders the masterbar with `props.user` data for displaying the user avatar.
