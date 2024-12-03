import { SHOW_ALL_SLUG } from '@automattic/design-picker';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { gatherCategories } from './utils';
import type { Category, Design } from '@automattic/design-picker';

export interface Categorization {
	selection: string | null;
	onSelect: ( selectedSlug: string | null ) => void;
	categories: Category[];
}

interface UseCategorizationOptions {
	defaultSelection: string | null;
	showAllFilter?: boolean;
	sort?: ( a: Category, b: Category ) => number;
}

export function useCategorization(
	designs: Design[],
	{ defaultSelection, showAllFilter, sort }: UseCategorizationOptions
): Categorization {
	const translate = useTranslate();

	const categories = useMemo( () => {
		const result = gatherCategories( designs );
		if ( sort ) {
			result.sort( sort );
		}

		if ( showAllFilter && designs.length ) {
			result.unshift( {
				name: translate( 'Show All' ),
				slug: SHOW_ALL_SLUG,
			} );
		}

		return result;
	}, [ designs, showAllFilter, sort, translate ] );

	const [ selection, onSelect ] = useState< string | null >(
		chooseDefaultSelection( categories, defaultSelection )
	);

	useEffect( () => {
		if ( shouldSetToDefaultSelection( categories, selection ) ) {
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
 *	Check that the current selection still matches one of the category slugs,
 *	and if it doesn't reset the current selection to the default selection.
 *	@param categories the list of available categories
 *	@param currentSelection the slug of the current selected category
 *	@returns whether the current selection should be set to the default selection
 */
function shouldSetToDefaultSelection(
	categories: Category[],
	currentSelection: string | null
): boolean {
	// For an empty list, `null` selection is the only correct one.
	if ( categories.length === 0 && currentSelection === null ) {
		return false;
	}
	return ! categories.some( ( { slug } ) => slug === currentSelection );
}

/**
 * Chooses which category is the one that should be used by default.
 * If `defaultSelection` is a valid category slug then it'll be used, otherwise it'll be whichever
 * category appears first in the list.
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
