import { useSearchParams } from 'react-router-dom';

const usePatternPages = () => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const page_slugs = ( searchParams.get( 'page_slugs' ) || '' ).split( ',' ).filter( Boolean );

	const pages = page_slugs || [];

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
