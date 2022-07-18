# Search

The search module.

### Installation

Install the package.

```bash
yarn add @automattic/search
```

### Internationalization

This package depends directly on `@wordpress/i18n` for translations. This means consumers must provide locale data prior to using it.

### Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Using [Storybook](https://storybook.js.org/)

`yarn workspace @automattic/search run storybook`

## What's included?

### Search input

A search input component.

#### Search Modes

There are 2 search modes that can be used through the `searchMode` prop:

- `when-typing` (default): The search component calls the `onSearch` prop while the user is typing.
- `on-enter`: The search component only triggers the `onSearch` prop when the user hits the `Enter` key.

### `useFuzzySearch`

A hook that exposes fuzzy searching functionality.

It can be beneficial especially as the sites of the list of sites grow. Some users might want to find a site that they do not remember the exact name, so they can enter a partial string, or even one with typos, and the result would still be returned.

Example: imagine you're querying for `example.wordpress.com`. While "normal", substring search, would fail if you've searched for `exmple`, fuzzy search would still return the site.

#### Usage

The simplest form of usage is to pass an array of strings as the `data` argument, which is your collection:

```js
useFuzzySearch( {
	data: [ 'site.wordpress.com', 'another.wordpress.com' ]
} );
```

The hook returns an object with a few properties:
- `results`, which is your data;
- `query`, that is the searched term;
- `setQuery`, so you can change the term after an event (i.e. input change).


##### Searching an array of objects

You can also pass an array of objects as the `data`. That way you can search inside objects:

```js
useFuzzySearch( {
	data: [ { siteURL: 'site.wordpress.com', ... }, ... ],
	keys: [ 'siteURL', 'nested.key' ],
} );
```

Note that you must pass the `keys` argument so the hook indexes those keys. Those are the keys that will be accounted when searching. That argument is **required** when you're working with an array of objects.

##### Setting custom options

Beyond passing `keys` (and [its variations](https://fusejs.io/examples.html)), you can extend the hook by providing the `options` argument, which will extend the fuzzy search mechanism following [the options described by Fuse.js](https://fusejs.io/api/options.html).

##### Setting an initial query

It's also possible to set an initial query through the `initialQuery` argument. That'll be the the initial state for the returned `query` property and will be used as the initial search filter.
