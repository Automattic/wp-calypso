import Fuse from 'fuse.js';
import { useMemo } from 'react';

const defaultOptions = {
	threshold: 0.4,
	ignoreLocation: true,
};

type KeysProp< T > = T extends string
	? {
			keys?: never;
	  }
	: {
			keys: Fuse.IFuseOptions< T >[ 'keys' ];
	  };

export type UseFuzzySearchOptions< T > = {
	data: T[];
	options?: Partial< Fuse.IFuseOptions< T > >;
	query?: string;
} & Pick< KeysProp< T >, 'keys' >;

export const useFuzzySearch = < T >( {
	data,
	keys = [],
	query = '',
	options = defaultOptions,
}: UseFuzzySearchOptions< T > ) => {
	/**
	 * We want to re-use the `Fuse` instance because creating one every time
	 * the dataset changes is an expensive operation.
	 *
	 */
	const fuseInstance = useMemo( () => {
		return new Fuse( [], {
			keys,
			includeScore: false,
			includeMatches: false,
			...options,
		} );
	}, [ keys, options ] );

	const results = useMemo( () => {
		if ( ! query ) {
			return data;
		}

		// Every time the query or the data changes, we update the collection
		// This assignment takes less than 1ms for thousands of items
		fuseInstance.setCollection( data );

		return fuseInstance.search( query ).map( ( { item } ) => item );
	}, [ fuseInstance, query, data ] );

	return results;
};
