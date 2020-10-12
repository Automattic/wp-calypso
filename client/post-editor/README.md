# Editor

This section handles the rendering of the Calypso editor and all its individual components. It is responsible for the `/post` and `/page` routes.

## Architecture

This module uses a
[Flux](http://facebook.github.io/flux/docs/overview.html)-inspired architecture.

Actions and stores used by the views in this module are found in `lib/posts`.

The visual editor uses TinyMCE for the core functionality, and several React components for different flows (like media).
