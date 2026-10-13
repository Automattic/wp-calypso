/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { requestProductsList } from 'calypso/state/products-list/actions';
import productsList from 'calypso/state/products-list/reducer';
import { useOnSaleStatus } from '../use-is-on-sale';
import type { ReactNode } from 'react';
import type { AnyAction } from 'redux';

jest.mock( 'calypso/state/products-list/actions', () => ( {
	requestProductsList: jest.fn( () => ( { type: 'PRODUCTS_LIST_REQUEST' } ) ),
} ) );

const createTestStore = () =>
	createStore(
		( state: { productsList?: ReturnType< typeof productsList > } = {}, action: AnyAction ) => ( {
			productsList: productsList( state.productsList, action ),
		} ),
		applyMiddleware( thunk )
	);

const render = ( store: ReturnType< typeof createTestStore > ) => {
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<Provider store={ store }>{ children }</Provider>
	);
	return renderHook( () => useOnSaleStatus( 'jetpack_security_t1_yearly' ), { wrapper } ).result;
};

const receive = ( available: boolean, isPartialList = false ) => ( {
	type: PRODUCTS_LIST_RECEIVE,
	productsList: { jetpack_security_t1_yearly: { available } },
	productsListType: 'jetpack',
	isPartialList,
} );

describe( 'useOnSaleStatus', () => {
	beforeEach( () => {
		jest.mocked( requestProductsList ).mockClear();
	} );

	it( 'stays unknown on a cold load until the list arrives', () => {
		const store = createTestStore();
		const result = render( store );
		expect( result.current ).toBe( 'unknown' );

		act( () => {
			store.dispatch( receive( true ) );
		} );
		expect( result.current ).toBe( 'on-sale' );
		expect( requestProductsList ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports off sale once the list says so', () => {
		const store = createTestStore();
		const result = render( store );

		act( () => {
			store.dispatch( receive( false ) );
		} );
		expect( result.current ).toBe( 'off-sale' );
	} );

	it( 'reports off sale once requesting the list has failed', () => {
		const store = createTestStore();
		const result = render( store );

		act( () => {
			store.dispatch( { type: PRODUCTS_LIST_REQUEST_FAILURE } );
		} );
		expect( result.current ).toBe( 'off-sale' );
		expect( requestProductsList ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'requests the full list after an unrelated slug-filtered request settles', () => {
		const store = createTestStore();
		store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
		const result = render( store );
		expect( requestProductsList ).not.toHaveBeenCalled();

		act( () => {
			store.dispatch( receive( true, true ) );
		} );
		expect( result.current ).toBe( 'unknown' );
		expect( requestProductsList ).toHaveBeenCalledWith( { type: 'jetpack' } );

		act( () => {
			store.dispatch( receive( true ) );
		} );
		expect( result.current ).toBe( 'on-sale' );
	} );
} );
