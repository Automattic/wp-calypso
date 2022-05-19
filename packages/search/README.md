# Search

A search input component.

## Installation

Install the component.

```bash
yarn add @automattic/search
```

## Internationalization

This package depends directly on `@wordpress/i18n` for translations. This means consumers must provide locale data prior to using the component.

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Using [Storybook](https://storybook.js.org/)

`yarn workspace @automattic/components run storybook`

### Search Modes

There are 2 search modes that can be used through the `searchMode` prop:

- `when-typing` (default): The search component calls the `onSearch` prop while the user is typing.
- `on-enter`: The search component only triggers the `onSearch` prop when the user hits the `Enter` key.
