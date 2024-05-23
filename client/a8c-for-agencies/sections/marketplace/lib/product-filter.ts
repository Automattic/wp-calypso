import {
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
} from '../constants';

export type SelectedFilters = {
	[ PRODUCT_FILTER_KEY_CATEGORIES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_TYPES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_PRICES ]: Record< string, boolean >;
};

export function hasSelectedFilter( selectedFilters: SelectedFilters ) {
	return Object.keys( selectedFilters ).some( ( key ) => {
		return Object.values( selectedFilters[ key as keyof SelectedFilters ] ).some(
			( selected ) => selected
		);
	} );
}
