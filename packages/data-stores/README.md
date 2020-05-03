# Calypso Data Stores

This package contains a collection of `@wordpress/data`-based stores that can be used to fetch data from various WordPress.com REST API endpoints.

It is meant to be helpful for projects developed inside the [Calypso monorepo](https://github.com/Automattic/wp-calypso) that don't want to use Calypso's (monolithic) Redux state tree.

To use stores from the package, import and register the relevant store to obtain its key:

```tsx
import React from 'react';
import { useSelect } from '@wordpress/data';
import { Verticals } from '@automattic/data-stores';

const VERTICALS_STORE = Verticals.register()

const VerticalSelect = () => ( {
	const verticals = useSelect( select =>
		select( VERTICALS_STORE ).getVerticals()
    );

    return (
        <ul>
            { verticals.map( vertical => (
                    <li key={ vertical.vertical_id }>{ vertical.vertical_name }</li>
            ) ) }
        </ul>
    );
} );

```

The stores in this package are written in TypeScript, and type definitions are generated as part of the build process. Furthermore, we're injecting type information for available selectors and actions into the `@wordpress/data` module, which means that you'll get handy autocomplete suggestions, if you're writing your project in TypeScript and you've enabled your editor's TypeScript feature or plugin.

![autocomplete](./autocomplete.gif)
