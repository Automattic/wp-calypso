import { useSearchParams } from 'react-router-dom';
import { INITIAL_PAGES, ORDERED_PATTERN_PAGES_CATEGORIES } from '../constants';
import { useCategoriesOrder } from '../hooks';
import { getPagePatternTitle } from '../utils';
import type { Pattern, Category, CustomPageTitle } from '../types';

const usePatternPages = (
	pagesMapByCategory: Record< string, Pattern[] >,
	categories: Category[],
	dotcomPatterns: Pattern[]
): {
	pages: Pattern[];
	pageSlugs: string[];
	setPageSlugs: ( slugs: string[] ) => void;
	pagesToShow: any[];
} => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	let pageCategoriesInOrder;
	let pageSlugs: string[] = [];
	let pages: Pattern[] = [];
	let pagesToShow: any[] = [];
	let mockedPages: CustomPageTitle[] = [];
	const page_slugs = searchParams.get( 'page_slugs' );
	const custom_pages = searchParams.get( 'custom_pages' );

	if ( page_slugs !== null ) {
		pageSlugs = page_slugs.split( ',' ).filter( Boolean );
	}

	// eslint-disable-next-line prefer-const
	pageCategoriesInOrder = useCategoriesOrder( categories, ORDERED_PATTERN_PAGES_CATEGORIES );

	if ( custom_pages !== null ) {
		try {
			mockedPages = JSON.parse( custom_pages );
		} catch ( e ) {}
	}

	// Pairs of page title and pattern id can be passed in the URL from AI flow.
	if ( mockedPages.length > 0 ) {
		mockedPages.forEach( ( { ID, title, selected }: CustomPageTitle ) => {
			const patterns = dotcomPatterns.filter( ( pattern: Pattern ) => pattern.ID === ID );
			if ( patterns.length === 0 ) {
				return;
			}
			const pattern = patterns[ 0 ];
			pattern.title = title;

			if ( selected ) {
				pageSlugs.push( pattern?.name || '' );
				pages.push( pattern );
			}
			pagesToShow.push( {
				name: pattern?.name || '',
				title: title,
				isSelected: !! selected,
			} );
		} );

		const setPageSlugs = ( slugs: string[] ) => {
			setSearchParams(
				( currentSearchParams ) => {
					const newMockedPages = mockedPages.map( ( page: CustomPageTitle ) => {
						const patterns = dotcomPatterns.filter(
							( pattern: Pattern ) => pattern.ID === page.ID
						);
						page.selected = slugs.includes( patterns[ 0 ].name );
						return page;
					} );
					currentSearchParams.set( 'custom_pages', JSON.stringify( newMockedPages ) );

					return currentSearchParams;
				},
				{ replace: true }
			);
		};

		return { pages, pageSlugs, setPageSlugs, pagesToShow };
	}

	if ( page_slugs === null ) {
		pageSlugs = INITIAL_PAGES;
	}

	pages = pageSlugs
		.map( ( slug ) => {
			const firstPage = pagesMapByCategory[ slug ]?.[ 0 ];
			if ( firstPage ) {
				return {
					...firstPage,
					title: getPagePatternTitle( firstPage ),
				};
			}
		} )
		.filter( Boolean ) as Pattern[];

	pagesToShow = pageCategoriesInOrder
		.map( ( category: Category ) => {
			const { name } = category;
			const firstPage = name && pagesMapByCategory[ name ][ 0 ];
			if ( firstPage ) {
				return {
					name,
					title: getPagePatternTitle( firstPage ),
					isSelected: pageSlugs.includes( name ),
				};
			}
		} )
		.filter( Boolean );

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
