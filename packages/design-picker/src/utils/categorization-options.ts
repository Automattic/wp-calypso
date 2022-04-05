import { isEnabled } from '@automattic/calypso-config';
import { Category } from '../types';
import { sortBlogCategoryToTop, sortStoreCategoryToTop, sortLocalServicesToTop } from '../utils';

export const getCategorizationOptionsForStep = ( intent: string, useDIFMThemes = false ) => {
	const result: {
		showAllFilter: boolean;
		defaultSelection: string | null;
		sort: ( a: Category, b: Category ) => 0 | 1 | -1;
	} = {
		showAllFilter: isEnabled( 'signup/design-picker-categories' ),
		defaultSelection: '',
		sort: sortBlogCategoryToTop,
	};
	switch ( intent ) {
		case 'write':
			result.defaultSelection = 'blog';
			result.sort = sortBlogCategoryToTop;
			break;
		case 'sell':
			result.defaultSelection = 'store';
			result.sort = sortStoreCategoryToTop;
			break;
		default:
			result.defaultSelection = null;
			result.sort = sortBlogCategoryToTop;
			break;
	}

	// This is a temporary change until DIFM Lite switches to the full WPCOM theme catalog.
	// We'll then use the 'difm' intent here.
	if ( useDIFMThemes ) {
		result.defaultSelection = null;
		result.sort = sortLocalServicesToTop;
	}

	return result;
};
