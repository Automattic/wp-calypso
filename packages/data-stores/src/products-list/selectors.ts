import { select } from '@wordpress/data';
import { STORE_KEY } from './constants';
import { APIProductsList } from './types';
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getProductsList = ( state: State ) => {
	return state.productsList;
};

export const getProductBySlug = ( _state: State, slug: string ) => {
	if ( ! slug ) {
		return undefined;
	}
	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ];
};

export function getProductCurrencyCode( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].currency_code;
}

export function getProductName( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].product_name;
}

export function getProductDescription( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].description;
}

export function getProductTerm( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].product_term;
}

export function getProductCost( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].cost_smallest_unit;
}

export function getProductPriceTierList( _state: State, slug: string ) {
	if ( ! slug ) {
		return undefined;
	}

	const products = (
		select( STORE_KEY ) as { getProductsList: () => APIProductsList | undefined }
	 ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ].price_tier_list;
}
