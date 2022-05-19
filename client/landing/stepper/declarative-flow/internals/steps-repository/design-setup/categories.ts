import { Category } from '@automattic/design-picker';

const CATEGORY_BLOG = 'blog';
const CATEGORY_STORE = 'store';

/**
 * Ensures the category appears at the top of the design category list
 * (directly below the Show All filter).
 */
function makeSortCategoryToTop( slug: string ) {
	return ( a: Category, b: Category ) => {
		if ( a.slug === b.slug ) {
			return 0;
		} else if ( a.slug === slug ) {
			return -1;
		} else if ( b.slug === slug ) {
			return 1;
		}
		return 0;
	};
}

const sortBlogToTop = makeSortCategoryToTop( CATEGORY_BLOG );
const sortStoreToTop = makeSortCategoryToTop( CATEGORY_STORE );

export function getCategorizationOptions( intent: string, showAllFilter: boolean ) {
	const result = {
		showAllFilter,
		defaultSelection: null,
	} as {
		showAllFilter: boolean;
		defaultSelection: string | null;
		sort: ( a: Category, b: Category ) => 0 | 1 | -1;
	};

	switch ( intent ) {
		case 'write':
			return {
				...result,
				defaultSelection: CATEGORY_BLOG,
				sort: sortBlogToTop,
			};
		case 'sell':
			return {
				...result,
				defaultSelection: CATEGORY_STORE,
				sort: sortStoreToTop,
			};
		default:
			return {
				...result,
				sort: sortBlogToTop,
			};
	}
}
