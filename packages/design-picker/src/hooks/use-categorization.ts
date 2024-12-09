import { useEffect, useMemo, useState, useCallback } from 'react';
import { Category } from '../types';

export interface Categorization {
	selections: string[];
	onSelect: ( selectedSlug: string ) => void;
	categories: Category[];
}

interface UseCategorizationOptions {
	defaultSelections: string[];
	isMultiSelection?: boolean;
	sort?: ( a: Category, b: Category ) => number;
}

export function useCategorization(
	categoryMap: Record< string, Category >,
	{ defaultSelections, isMultiSelection, sort }: UseCategorizationOptions
): Categorization {
	const categories = useMemo( () => {
		const categoryMapKeys = Object.keys( categoryMap ) || [];
		const result = categoryMapKeys.map( ( slug ) => ( {
			...categoryMap[ slug ],
			slug,
		} ) );

		return result.sort( sort );
	}, [ categoryMap, sort ] );

	const [ selections, setSelections ] = useState< string[] >(
		chooseDefaultSelections( categories, defaultSelections )
	);

	const onSelect = useCallback(
		( value: string ) => {
			setSelections( ( currentSelections: string[] ) => {
				if ( ! isMultiSelection ) {
					return [ value ];
				}

				const index = currentSelections.findIndex( ( selection ) => selection === value );
				if ( index === -1 ) {
					return [ ...currentSelections, value ];
				}

				// The selections should at least have one.
				return currentSelections.length > 1
					? [ ...currentSelections.slice( 0, index ), ...currentSelections.slice( index + 1 ) ]
					: currentSelections;
			} );
		},
		[ isMultiSelection, setSelections ]
	);

	useEffect( () => {
		if ( shouldSetToDefaultSelections( categories, selections ) ) {
			setSelections( chooseDefaultSelections( categories, defaultSelections ) );
		}
	}, [ categories, defaultSelections, selections ] );

	return {
		categories,
		selections,
		onSelect,
	};
}

/**
 *	Check that the current selections still match one of the category slugs,
 *	and if it doesn't reset the current selections to the default selections.
 *	@param categories the list of available categories
 *	@param currentSelections the slugs of the current selected category
 *	@returns whether the current selections should be set to the default selections
 */
function shouldSetToDefaultSelections(
	categories: Category[],
	currentSelections: string[]
): boolean {
	// For an empty list, the empty selections is the only correct one.
	if ( categories.length === 0 && currentSelections.length === 0 ) {
		return false;
	}

	const currentSelectionsSet = new Set( currentSelections );
	return ! categories.some( ( { slug } ) => currentSelectionsSet.has( slug ) );
}

/**
 * Chooses which category is the one that should be used by default.
 * If `defaultSelections` is a valid category slug then it'll be used, otherwise it'll be whichever
 * category appears first in the list.
 * @param categories the categories from which the default will be selected
 * @param defaultSelections use this category as the default selections if possible
 * @returns the default category or null if none is available
 */
function chooseDefaultSelections( categories: Category[], defaultSelections: string[] ): string[] {
	const defaultSelectionsSet = new Set( defaultSelections );
	if ( defaultSelections && categories.find( ( { slug } ) => defaultSelectionsSet.has( slug ) ) ) {
		return defaultSelections;
	}

	return categories[ 0 ]?.slug ? [ categories[ 0 ]?.slug ] : [];
}
