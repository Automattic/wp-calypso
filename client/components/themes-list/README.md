# ThemesList

Themes list component: displays a list of Theme components.

## `index.jsx`

Given an array of themes, this component creates a corresponding list of theme components to display
information about those themes.

Each item in the `themes` array prop must contain theme attributes that can be used by the `Theme` component.
Other accepted props are two boolean flags and a callback, all of which are related to pagination.

## Props

- `emptyContent`: element ( optional ), element that will be displayed when the list is empty, if null or not provided default EmptyContent will be used.

For a complete list of props along with their types, please refer to the `ThemesList` component's `propTypes` member.
