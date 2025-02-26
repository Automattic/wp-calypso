import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	PRODUCT_FILTER_KEY_BRAND,
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
} from '../../constants';
import { SelectedFilters } from '../../lib/product-filter';

const DEFAULT_SELECTED_FILTERS = {
	[ PRODUCT_FILTER_KEY_BRAND ]: '',
	[ PRODUCT_FILTER_KEY_CATEGORIES ]: {},
	[ PRODUCT_FILTER_KEY_TYPES ]: {},
	[ PRODUCT_FILTER_KEY_PRICES ]: {},
};

type Props = {
	productBrand: string;
};

export default function useSelectedProductFilters( { productBrand }: Props ) {
	const [ selectedFilters, setSelectedFilters ] = useState< SelectedFilters >( {
		...DEFAULT_SELECTED_FILTERS,
		[ PRODUCT_FILTER_KEY_BRAND ]: productBrand,
	} );

	const resetFilters = useCallback( () => {
		setSelectedFilters( {
			...DEFAULT_SELECTED_FILTERS,
			[ PRODUCT_FILTER_KEY_BRAND ]: productBrand,
		} );
	}, [ productBrand ] );

	useEffect( () => {
		setSelectedFilters( ( state ) => ( {
			...state,
			[ PRODUCT_FILTER_KEY_BRAND ]: productBrand,
		} ) );
	}, [ productBrand ] );

	return useMemo(
		() => ( {
			selectedFilters,
			setSelectedFilters,
			resetFilters,
		} ),
		[ resetFilters, selectedFilters ]
	);
}
