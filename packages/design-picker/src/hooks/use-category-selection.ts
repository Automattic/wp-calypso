import { useEffect, useState } from 'react';
import { useCategorization } from './use-categorization';
import type { Category, Design } from '../types';

type UseCategorySelectionResult = [ string | null, ( categorySlug: string | null ) => void ];

export function useCategorySelection(
	designs: Design[],
	showAllFilter: boolean,
	defaultSelection: string | null
): UseCategorySelectionResult {
	const categories = useCategorization( designs, showAllFilter );
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

	return [ selectedCategory, setSelectedCategory ];
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
