import Fuse from 'fuse.js';
import { useState, useMemo } from 'react';

const defaultOptions = {
	threshold: 0.4,
	distance: 20,
};

type UseFuzzySearchOptions< T > = {
	data: T[];
	fields: Fuse.IFuseOptions< T >[ 'keys' ];
	options?: Partial< Fuse.IFuseOptions< T > >;
	initialQuery?: string;
};

export const useFuzzySearch = < T >( {
	data,
	fields,
	initialQuery = '',
	options = defaultOptions,
}: UseFuzzySearchOptions< T > ) => {
	const [ query, setQuery ] = useState( initialQuery );

	const fuseInstance = useMemo( () => {
		return new Fuse( data, {
			keys: fields,
			includeScore: false,
			includeMatches: false,
			...options,
		} );
	}, [ data, fields, options ] );

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
