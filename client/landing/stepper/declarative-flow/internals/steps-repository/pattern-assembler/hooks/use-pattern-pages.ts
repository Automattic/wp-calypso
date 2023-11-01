import { isEnabled } from '@automattic/calypso-config';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGE } from '../constants';

const usePatternPages = () => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const page_slugs = ( searchParams.get( 'page_slugs' ) || '' ).split( ',' ).filter( Boolean );

	const pages = page_slugs.length
		? page_slugs
		: [ ...( isEnabled( 'pattern-assembler/add-pages' ) ? [ INITIAL_PAGE ] : [] ) ];

	const setPages = ( pages: string[] ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( pages.length === 0 ) {
					currentSearchParams.delete( 'page_slugs' );
				} else {
					currentSearchParams.set( 'page_slugs', pages.join( ',' ) );
				}

				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	return { pages, setPages };
};

export default usePatternPages;
