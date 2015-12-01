Layout
======

This module handles the base page layout for Calypso leveraged by all other sub-views, including the WordPress.com masterbar.

### masterbar.jsx

Renders the masterbar with `props.user` data for displaying the user avatar. This component should not be called directly. It's managed by the main layout component.

The Masterbar used across all of WordPress.com is based on this component. If changes are made to the Masterbar here, they should probably also be reflected there.
