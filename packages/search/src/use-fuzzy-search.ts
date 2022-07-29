import Fuse from 'fuse.js';
import { useMemo } from 'react';

const defaultOptions = {
	threshold: 0.4,
	distance: 20,
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
} & KeysProp< T >;

export type UseFuzzySearchResult< T > = Fuse.FuseResult< T >;

export const useFuzzySearch = < T >( {
	data,
	keys = [],
	query = '',
	options = defaultOptions,
}: UseFuzzySearchOptions< T > ): UseFuzzySearchResult< T >[] => {
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
			return data.map( ( item, refIndex ) => ( { item, refIndex } ) );
		}

		// Every time the query or the data changes, we update the collection
		// This assignment takes less than 1ms for thousands of items
		fuseInstance.setCollection( data );

		return fuseInstance.search( query );
	}, [ fuseInstance, query, data ] );

	return results;
};
