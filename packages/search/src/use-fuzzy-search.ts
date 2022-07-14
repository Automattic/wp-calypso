import Fuse from 'fuse.js';
import { useState, useMemo, useEffect } from 'react';

const defaultOptions = {
	threshold: 0.4,
	distance: 20,
};

type FieldsProp< T > = T extends string
	? {
			fields?: never;
	  }
	: {
			fields: Fuse.IFuseOptions< T >[ 'keys' ];
	  };

export type UseFuzzySearchOptions< T > = {
	data: T[];
	options?: Partial< Fuse.IFuseOptions< T > >;
	initialQuery?: string;
} & FieldsProp< T >;

export const useFuzzySearch = < T >( {
	data,
	fields = [],
	initialQuery = '',
	options = defaultOptions,
}: UseFuzzySearchOptions< T > ) => {
	const [ query, setQuery ] = useState( initialQuery );

	/**
	 * We want to re-use the `Fuse` instance because creating one every time
	 * the dataset changes is an expensive operation.
	 *
	 * I first used `useRef` to save that instance, but that hook does not allow
	 * lazy instantiation of the initial value, so I had to create wrapper functions
	 * and the result didn't look great.
	 *
	 * Falling back to `useState` fixes that problem, though now we have to add
	 * the `fuseInstance` variable to the dependency array.
	 *
	 */
	const [ fuseInstance ] = useState< Fuse< T > >( () => {
		return new Fuse< T >( data, {
			keys: fields,
			includeScore: false,
			includeMatches: false,
			...options,
		} );
	} );

	useEffect( () => {
		fuseInstance.setCollection( data );
	}, [ fuseInstance, data ] );

	const results = useMemo( () => {
		if ( ! query ) {
			return data;
		}

		return fuseInstance.search( query ).map( ( { item } ) => item );
	}, [ fuseInstance, query, data ] );

	return {
		results,
		query,
		setQuery,
	};
};
