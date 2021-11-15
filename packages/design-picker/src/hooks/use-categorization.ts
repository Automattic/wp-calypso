import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { SHOW_ALL_SLUG } from '../constants';
import { Category, Design } from '../types';
import { gatherCategories } from '../utils';

type UseCategorizationResult = [
	Category[],
	string | null,
	( categorySlug: string | null ) => void
];

export function useCategorization(
	designs: Design[],
	showAllFilter: boolean
): UseCategorizationResult {
	const { __ } = useI18n();

	const categories = gatherCategories( designs );
	if ( showAllFilter && designs.length ) {
		categories.unshift( {
			name: __( 'Show All', __i18n_text_domain__ ),
			slug: SHOW_ALL_SLUG,
		} );
	}

	const [ selectedCategory, setSelectedCategory ] = useState< string | null >(
		chooseDefaultSelection( categories )
	);

	useEffect( () => {
		// When the category list changes check that the current selection
		// still matches one of the given slugs, and if it doesn't reset
		// the current selection.
		const findResult = categories.find( ( { slug } ) => slug === selectedCategory );
		if ( ! findResult ) {
			setSelectedCategory( chooseDefaultSelection( categories ) );
		}
	}, [ categories, selectedCategory ] );

	return [ categories, selectedCategory, setSelectedCategory ];
}

/**
 * Chooses which category is the one that should be used by default. It'll be
 * whichever category is first in the list.
 *
 * @param categories the categories from which the default will be selected
 * @returns the default category or null if none is available
 */
function chooseDefaultSelection( categories: Category[] ): string | null {
	return categories[ 0 ]?.slug ?? null;
}
