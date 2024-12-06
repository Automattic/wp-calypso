import { useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
	const [ searchParams, setSearchParams ] = useSearchParams();

	const categories = useMemo( () => {
		const categoryMapKeys = Object.keys( categoryMap ) || [];
		const result = categoryMapKeys.map( ( slug ) => ( {
			...categoryMap[ slug ],
			slug,
		} ) );

		return result.sort( sort );
	}, [ categoryMap, sort ] );

	const selections = searchParams.get( 'categories' )?.split( ',' ) || [];

	const setSelections = ( values: string[] ) => {
		setSearchParams( ( currentSearchParams ) => {
			if ( values.length > 0 ) {
				currentSearchParams.set( 'categories', values.join( ',' ) );
			} else {
				currentSearchParams.delete( 'categories' );
			}
			return currentSearchParams;
		} );
	};

	const onSelect = useCallback(
		( value: string ) => {
			if ( ! isMultiSelection ) {
				handleSelect?.( value );
				setSelections( [ value ] );
				return;
			}

			const currentSelections = searchParams.get( 'categories' )?.split( ',' ) || [];
			const index = currentSelections.findIndex( ( selection ) => selection === value );
			if ( index === -1 ) {
				handleSelect?.( value );
				return setSelections( [ ...currentSelections, value ] );
			}

			// The selections should at least have one.
			if ( currentSelections.length > 1 ) {
				handleDeselect?.( value );
				return setSelections( [
					...currentSelections.slice( 0, index ),
					...currentSelections.slice( index + 1 ),
				] );
			}
		},
		[ searchParams, isMultiSelection, setSelections, handleSelect, handleDeselect ]
	);

	useEffect( () => {
		if ( selections.length === 0 ) {
			setSelections( chooseDefaultSelections( categories, defaultSelections ) );
		}
	}, [] );

	return {
		categories,
		selections,
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
	const defaultSelectionsSet = new Set( defaultSelections );
	if ( defaultSelections && categories.find( ( { slug } ) => defaultSelectionsSet.has( slug ) ) ) {
		return defaultSelections;
	}

	return categories[ 0 ]?.slug ? [ categories[ 0 ]?.slug ] : [];
}
