import Fuse from 'fuse.js';
import { useState, useMemo } from 'react';

const defaultOptions = {
	threshold: 0.4,
	distance: 20,
};

type UseFuzzySearchOptions< T > = {
	data: T[];
	fields: ( keyof T )[];
	options?: Partial< Fuse.FuseOptions< T > >;
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
		return new Fuse< T, typeof options >( data, {
			keys: fields,
			includeScore: false,
			includeMatches: false,
			...options,
		} );
	}, [ data, fields, options ] );

	const results = useMemo( () => {
		if ( ! query ) {
			return fuseInstance.list;
		}

		return fuseInstance.search( query );
	}, [ fuseInstance, query ] );

	return {
		results: results as T[], // Casting to remove the `readonly` modifier added by Fuse
		query,
		setQuery,
	};
};
