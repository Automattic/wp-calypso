Theme Data
==========

Contains stores and action creators for themes, and the theme showcase.

## Stores

We're transitioning to a more `redux`-like architecture, so our Flux `./stores` are created from `./reducers`.

### current-theme

Manages data concerning each site's currently selected theme.

### theme-last-event

Tracks last searched terms and activated theme, for analytics purposes.

### themes-last-query

Tracks the last themes query.

### themes-list

Manages the list of themes, per query.

### themes

Contains a global list of themes queried so far.
