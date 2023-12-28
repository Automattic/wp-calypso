import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGES, ORDERED_PATTERN_PAGES_CATEGORIES } from '../constants';
import { useCategoriesOrder } from '../hooks';
import type { Pattern, Category, Tag } from '../types';

const usePatternPages = (
	pagesMapByCategory: Record< string, Pattern[] >,
	categories: Category[]
) => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	let pageCategoriesInOrder;
	let pageSlugs: string[] = [];
	let pages;
	let pagesToShow;
	const page_slugs = searchParams.get( 'page_slugs' );

	if ( page_slugs !== null ) {
		pageSlugs = page_slugs.split( ',' ).filter( Boolean );
	}

	// eslint-disable-next-line prefer-const
	pageCategoriesInOrder = useCategoriesOrder( categories, ORDERED_PATTERN_PAGES_CATEGORIES );

	// This is a way to mock/inject pages that are not in the pattern repository. We may continue with this approach later.:
	// eslint-disable-next-line no-constant-condition
	if ( false ) {
		const mockedPages = [ 'Potato', 'Potato 2', 'Potato 3' ];
		pages = mockedPages.map(
			( title ) =>
				< Pattern >{
					ID: Math.floor( Math.random() * 1000000 ),
					// Title with whitespace and special characters replaced with _
					name: title.replace( /[^a-z0-9]/gi, '_' ).toLowerCase(),
					title: title,
					html: '<h1>Test</h1>',
					tags: {
						assembler_page: < Tag >{
							slug: 'assembler_page',
							title: 'Assembler page',
							description: '',
						},
					},
					categories: {},
				}
		);
		if ( page_slugs === null ) {
			pageSlugs = pages.map( ( page ) => page.name );
		}

		pagesToShow = pages.map( ( page ) => {
			return {
				name: page.name,
				hasPages: true,
				title: page.title,
				isSelected: pageSlugs.includes( page.name ),
			};
		} );
	} else {
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
