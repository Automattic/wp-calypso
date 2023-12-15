import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGES, ORDERED_PATTERN_PAGES_CATEGORIES } from '../constants';
import { useCategoriesOrder } from '../hooks';
import type { Pattern, Category } from '../types';

const usePatternPages = (
	pagesMapByCategory: Record< string, Pattern[] >,
	categories: Category[]
) => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const pageCategoriesInOrder = useCategoriesOrder( categories, ORDERED_PATTERN_PAGES_CATEGORIES );
	const page_slugs = searchParams.get( 'page_slugs' );

	const pageSlugs = page_slugs !== null ? page_slugs.split( ',' ).filter( Boolean ) : INITIAL_PAGES;

	const pages = pageSlugs.map( ( slug ) => pagesMapByCategory[ slug ]?.[ 0 ] ).filter( Boolean );

	const pagesToShow = pageCategoriesInOrder.map( ( category: Category ) => {
		const { name } = category;
		const hasPages = name && pagesMapByCategory[ name ]?.length;
		return {
			name,
			hasPages,
			title: hasPages ? pagesMapByCategory[ name ][ 0 ].title : '',
			isSelected: name ? pageSlugs.includes( name ) : false,
		};
	} );

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

	return { pages, pageSlugs, setPageSlugs, pagesToShow };
};

export default usePatternPages;
