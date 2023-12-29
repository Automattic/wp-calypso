import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGES, ORDERED_PATTERN_PAGES_CATEGORIES } from '../constants';
import { useCategoriesOrder } from '../hooks';
import type { Pattern, Category, CustomPageTitle } from '../types';

const usePatternPages = (
	pagesMapByCategory: Record< string, Pattern[] >,
	categories: Category[],
	dotcomPatterns: Pattern[]
) => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	let pageCategoriesInOrder;
	let pageSlugs: string[] = [];
	let pages: ( Pattern | null )[] = [];
	let pagesToShow;
	const page_slugs = searchParams.get( 'page_slugs' );
	const custom_pages = searchParams.get( 'custom_pages' );

	if ( page_slugs !== null ) {
		pageSlugs = page_slugs.split( ',' ).filter( Boolean );
	}

	pages = [];

	// eslint-disable-next-line prefer-const
	pageCategoriesInOrder = useCategoriesOrder( categories, ORDERED_PATTERN_PAGES_CATEGORIES );

	// Pairs of page title and pattern id can be passed in the URL from AI flow.
	if ( custom_pages !== null ) {
		const mockedPages: CustomPageTitle[] = JSON.parse( custom_pages ) || [];

		pages = mockedPages
			.map( ( { ID, title }: CustomPageTitle ) => {
				const patterns = dotcomPatterns.filter( ( pattern: Pattern ) => pattern.ID === ID );
				if ( patterns.length < 1 ) {
					return null;
				}
				const pattern = patterns[ 0 ];
				pattern.title = title;

				return pattern;
			} )
			.filter( Boolean );

		if ( page_slugs === null ) {
			pageSlugs = pages.map( ( page ) => page?.name || '' );
		}

		pagesToShow = pages.map( ( page ) => {
			return {
				name: page?.name || '',
				hasPages: true,
				title: page?.title || '',
				isSelected: pageSlugs.includes( page?.name || '' ),
			};
		} );
	} else if ( custom_pages === null ) {
		if ( page_slugs === null ) {
			pageSlugs = INITIAL_PAGES;
		}

		pages = pageSlugs.map( ( slug ) => pagesMapByCategory[ slug ]?.[ 0 ] ).filter( Boolean );

		pagesToShow = pageCategoriesInOrder.map( ( category: Category ) => {
			const { name } = category;
			const hasPages = name && pagesMapByCategory[ name ]?.length;
			return {
				name,
				hasPages,
				title: hasPages ? pagesMapByCategory[ name ][ 0 ].title : '',
				isSelected: name ? pageSlugs.includes( name ) : false,
			};
		} );
	}

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
