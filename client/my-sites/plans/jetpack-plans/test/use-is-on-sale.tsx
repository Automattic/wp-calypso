/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import productsList from 'calypso/state/products-list/reducer';
import { useOnSaleStatus } from '../use-is-on-sale';
import type { ReactNode } from 'react';
import type { AnyAction } from 'redux';

const setup = () => {
	const store = createStore(
		( state: { productsList?: ReturnType< typeof productsList > } = {}, action: AnyAction ) => ( {
			productsList: productsList( state.productsList, action ),
		} )
	);
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<Provider store={ store }>{ children }</Provider>
	);
	const { result } = renderHook( () => useOnSaleStatus( 'jetpack_security_t1_yearly' ), {
		wrapper,
	} );
	return { store, result };
};

const receive = ( available: boolean ) => ( {
	type: PRODUCTS_LIST_RECEIVE,
	productsList: { jetpack_security_t1_yearly: { available } },
	productsListType: 'jetpack',
} );

describe( 'useOnSaleStatus', () => {
	it( 'stays unknown on a cold load until the list arrives', () => {
		const { store, result } = setup();
		expect( result.current ).toBe( 'unknown' );

		act( () => {
			store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
		} );
		expect( result.current ).toBe( 'unknown' );

		act( () => {
			store.dispatch( receive( true ) );
		} );
		expect( result.current ).toBe( 'on-sale' );
	} );

	it( 'reports off sale once the list says so', () => {
		const { store, result } = setup();

		act( () => {
			store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
			store.dispatch( receive( false ) );
		} );
		expect( result.current ).toBe( 'off-sale' );
	} );

	it( 'reports off sale after a failed request', () => {
		const { store, result } = setup();

		act( () => {
			store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
		} );
		act( () => {
			store.dispatch( { type: PRODUCTS_LIST_REQUEST_FAILURE } );
		} );
		expect( result.current ).toBe( 'off-sale' );
	} );
} );
