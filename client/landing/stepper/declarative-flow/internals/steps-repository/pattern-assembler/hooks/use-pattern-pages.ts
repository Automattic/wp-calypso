import { isEnabled } from '@automattic/calypso-config';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGES } from '../constants';
import type { Pattern } from '../types';

const usePatternPages = ( pagesMapByCategory: Record< string, Pattern[] > ) => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const page_slugs = searchParams.get( 'page_slugs' );

	const pageSlugs =
		page_slugs !== null
			? page_slugs.split( ',' ).filter( Boolean )
			: [ ...( isEnabled( 'pattern-assembler/add-pages' ) ? INITIAL_PAGES : [] ) ];

	const pages = pageSlugs.map( ( slug ) => pagesMapByCategory[ slug ]?.[ 0 ] ).filter( Boolean );

	const setPageSlugs = ( slugs: string[] ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( slugs.length === 0 ) {
					currentSearchParams.set( 'page_slugs', '' );
				} else {
					currentSearchParams.set( 'page_slugs', slugs.join( ',' ) );
				}

				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	return { pages, pageSlugs, setPageSlugs };
};

export default usePatternPages;
