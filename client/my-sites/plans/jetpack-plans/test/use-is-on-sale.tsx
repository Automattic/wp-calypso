/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import productsList from 'calypso/state/products-list/reducer';
import useIsOnSale, { useOnSaleStatus } from '../use-is-on-sale';
import type { ReactNode } from 'react';
import type { AnyAction } from 'redux';

const setFlag = ( enabled: boolean ) =>
	jest
		.spyOn( config, 'isEnabled' )
		.mockImplementation( ( flag ) => enabled && flag === 'jetpack/pro-bundles' );

const setup = < T, >( hook: () => T ) => {
	const store = createStore(
		( state: { productsList?: ReturnType< typeof productsList > } = {}, action: AnyAction ) => ( {
			productsList: productsList( state.productsList, action ),
		} )
	);
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<Provider store={ store }>{ children }</Provider>
	);
	const { result } = renderHook( hook, { wrapper } );
	return { store, result };
};

const receive = (
	{ pro = false, security = false }: { pro?: boolean; security?: boolean },
	isPartialList = false
) => ( {
	type: PRODUCTS_LIST_RECEIVE,
	productsList: {
		jetpack_pro_yearly: { available: pro },
		jetpack_security_t1_yearly: { available: security },
	},
	productsListType: 'jetpack',
	isPartialList,
} );

beforeEach( () => setFlag( false ) );

describe( 'useIsOnSale', () => {
	it( 'keeps today’s bundles and hides Pro while Pro is off sale', () => {
		const { store, result } = setup( useIsOnSale );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( true );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( false );

		act( () => {
			store.dispatch( receive( {} ) );
		} );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( true );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( false );
	} );

	it( 'hides every off-sale bundle once Pro is on sale', () => {
		const { store, result } = setup( useIsOnSale );

		act( () => {
			store.dispatch( receive( { pro: true } ) );
		} );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( true );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( false );
	} );

	it( 'hides every off-sale bundle while the flag is on', () => {
		setFlag( true );
		const { store, result } = setup( useIsOnSale );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( false );

		act( () => {
			store.dispatch( receive( { security: true } ) );
		} );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( true );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( false );
	} );
} );

describe( 'useOnSaleStatus', () => {
	const useStatus = () => useOnSaleStatus( 'jetpack_security_t1_yearly' );

	it( 'reports on sale without waiting while Pro is off sale', () => {
		const { store, result } = setup( useStatus );
		expect( result.current ).toBe( 'on-sale' );

		act( () => {
			store.dispatch( receive( {} ) );
		} );
		expect( result.current ).toBe( 'on-sale' );
	} );

	it( 'reports off sale once Pro is on sale and the product is not', () => {
		const { store, result } = setup( useStatus );

		act( () => {
			store.dispatch( receive( { pro: true } ) );
		} );
		expect( result.current ).toBe( 'off-sale' );
	} );

	describe( 'while the flag is on', () => {
		beforeEach( () => setFlag( true ) );

		it( 'stays unknown on a cold load until the list arrives', () => {
			const { store, result } = setup( useStatus );
			expect( result.current ).toBe( 'unknown' );

			act( () => {
				store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
			} );
			expect( result.current ).toBe( 'unknown' );

			act( () => {
				store.dispatch( receive( { security: true } ) );
			} );
			expect( result.current ).toBe( 'on-sale' );
		} );

		it( 'stays unknown after an unrelated slug-filtered list', () => {
			const { store, result } = setup( useStatus );

			act( () => {
				store.dispatch( receive( { security: true }, true ) );
			} );
			expect( result.current ).toBe( 'unknown' );
		} );

		it( 'reports off sale after a failed request, but not while retrying', () => {
			const { store, result } = setup( useStatus );

			act( () => {
				store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
				store.dispatch( { type: PRODUCTS_LIST_REQUEST_FAILURE } );
			} );
			expect( result.current ).toBe( 'off-sale' );

			act( () => {
				store.dispatch( { type: PRODUCTS_LIST_REQUEST } );
			} );
			expect( result.current ).toBe( 'unknown' );
		} );
	} );
} );
