import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useMemo, useState } from 'react';
import { SHOW_ALL_SLUG } from '../constants';
import { Category, Design } from '../types';
import { gatherCategories } from '../utils';

export interface Categorization {
	selection: string | null;
	onSelect: ( selectedSlug: string | null ) => void;
	categories: Category[];
}

interface UseCategorizationOptions {
	defaultSelection: string | null;
	showAllFilter: boolean;
	sort?: ( a: Category, b: Category ) => number;
}

export function useCategorization(
	designs: Design[],
	{ defaultSelection, showAllFilter, sort }: UseCategorizationOptions
): Categorization {
	const { __ } = useI18n();

	const categories = useMemo( () => {
		const result = gatherCategories( designs );
		if ( sort ) {
			result.sort( sort );
		}

		if ( showAllFilter && designs.length ) {
			result.unshift( {
				name: __( 'Show All', __i18n_text_domain__ ),
				slug: SHOW_ALL_SLUG,
			} );
		}

		return result;
	}, [ designs, showAllFilter, sort, __ ] );

	const [ selection, onSelect ] = useState< string | null >(
		chooseDefaultSelection( categories, defaultSelection )
	);

	useEffect( () => {
		// When the category list changes check that the current selection
		// still matches one of the given slugs, and if it doesn't reset
		// the current selection.
		const findResult = categories.find( ( { slug } ) => slug === selection );
		if ( ! findResult ) {
			onSelect( chooseDefaultSelection( categories, defaultSelection ) );
		}
	}, [ categories, defaultSelection, selection ] );

	return {
		categories,
		selection,
		onSelect,
	};
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
