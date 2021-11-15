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
	showAllFilter: boolean,
	defaultSelection: string | null
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
		chooseDefaultSelection( categories, defaultSelection )
	);

	useEffect( () => {
		// When the category list changes check that the current selection
		// still matches one of the given slugs, and if it doesn't reset
		// the current selection.
		const findResult = categories.find( ( { slug } ) => slug === selectedCategory );
		if ( ! findResult ) {
			setSelectedCategory( chooseDefaultSelection( categories, defaultSelection ) );
		}
	}, [ categories, defaultSelection, selectedCategory ] );

	return [ categories, selectedCategory, setSelectedCategory ];
}

/**
 * Chooses which category is the one that should be used by default.
 * If `defaultSelection` is a valid category slug then it'll be used, otherwise it'll be whichever
 * category appears first in the list.
 *
 * @param categories the categories from which the default will be selected
 * @param defaultSelection use this category as the default selection if possible
 * @returns the default category or null if none is available
 */
function chooseDefaultSelection(
	categories: Category[],
	defaultSelection: string | null
): string | null {
	if ( defaultSelection && categories.find( ( { slug } ) => slug === defaultSelection ) ) {
		return defaultSelection;
	}

	return categories[ 0 ]?.slug ?? null;
}
