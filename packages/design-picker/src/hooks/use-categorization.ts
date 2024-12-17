import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useDesignPickerFilters } from './use-design-picker-filters';
import type { Category } from '../types';

export interface Categorization {
	categories: Category[];
	selections: string[];
	isSelectionsChanged: boolean;
	onSelect: ( selectedSlug: string ) => void;
}

interface UseCategorizationOptions {
	defaultSelections: string[];
	isMultiSelection?: boolean;
	sort?: ( a: Category, b: Category ) => number;
	handleSelect?: ( slug: string ) => void;
	handleDeselect?: ( slug: string ) => void;
}

export function useCategorization(
	categoryMap: Record< string, Category >,
	{
		defaultSelections,
		isMultiSelection,
		sort,
		handleSelect,
		handleDeselect,
	}: UseCategorizationOptions
): Categorization {
	const isInitRef = useRef( false );
	const categories = useMemo( () => {
		const categoryMapKeys = Object.keys( categoryMap ) || [];
		const result = categoryMapKeys.map( ( slug ) => ( {
			...categoryMap[ slug ],
			slug,
		} ) );

		return result.sort( sort );
	}, [ categoryMap, sort ] );

	const { selectedCategories, setSelectedCategories } = useDesignPickerFilters();
	const isSelectionsChanged = useMemo(
		() =>
			defaultSelections.length !== selectedCategories.length ||
			! defaultSelections.every( ( selection ) => selectedCategories.includes( selection ) ),
		[ defaultSelections, selectedCategories ]
	);

	const onSelect = useCallback(
		( value: string ) => {
			if ( ! isMultiSelection ) {
				handleSelect?.( value );
				setSelectedCategories( [ value ] );
				return;
			}

			const index = selectedCategories.findIndex( ( selection ) => selection === value );
			if ( index === -1 ) {
				handleSelect?.( value );
				return setSelectedCategories( [ ...selectedCategories, value ] );
			}

			handleDeselect?.( value );
			return setSelectedCategories( [
				...selectedCategories.slice( 0, index ),
				...selectedCategories.slice( index + 1 ),
			] );
		},
		[
			selectedCategories,
			isMultiSelection,
			isSelectionsChanged,
			setSelectedCategories,
			handleSelect,
			handleDeselect,
		]
	);

	useEffect( () => {
		if ( ! isInitRef.current && categories.length > 0 && selectedCategories.length === 0 ) {
			setSelectedCategories( chooseDefaultSelections( categories, defaultSelections ) );
			isInitRef.current = true;
		}
	}, [ isInitRef, categories ] );

	return {
		categories,
		selections: selectedCategories,
		isSelectionsChanged,
		onSelect,
	};
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
	const categorySlugsSet = new Set( categories.map( ( { slug } ) => slug ) );
	const availableDefaultSelections = defaultSelections.filter( ( selection ) =>
		categorySlugsSet.has( selection )
	);
	if ( availableDefaultSelections.length > 0 ) {
		return availableDefaultSelections;
	}

	return categories[ 0 ]?.slug ? [ categories[ 0 ]?.slug ] : [];
}
