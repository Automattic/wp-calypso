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
	it( 'follows the catalog through launch, a Pro-only rollback and a full restore', () => {
		const { store, result } = setup( useIsOnSale );
		const offered = () =>
			[ 'jetpack_pro_yearly', 'jetpack_security_t1_yearly', 'jetpack_starter_yearly' ].filter(
				result.current
			);
		const steps: [ Parameters< typeof receive >[ 0 ], string[] ][] = [
			[ { security: true }, [ 'jetpack_security_t1_yearly', 'jetpack_starter_yearly' ] ],
			[ { pro: true }, [ 'jetpack_pro_yearly' ] ],
			[ {}, [] ],
			[ { security: true }, [ 'jetpack_security_t1_yearly', 'jetpack_starter_yearly' ] ],
		];

		for ( const [ catalog, expected ] of steps ) {
			act( () => {
				store.dispatch( receive( catalog ) );
			} );
			expect( offered() ).toEqual( expected );
		}
	} );

	it.each( [
		[ 'cold', [] ],
		[ 'partial', [ receive( { security: true }, true ) ] ],
		[ 'failed', [ { type: PRODUCTS_LIST_REQUEST_FAILURE } ] ],
	] )( 'offers no bundle after a %s load', ( _, actions: AnyAction[] ) => {
		const { store, result } = setup( useIsOnSale );

		act( () => {
			actions.forEach( ( action ) => store.dispatch( action ) );
		} );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( false );
	} );

	it( 'hides every off-sale bundle while the flag is on', () => {
		setFlag( true );
		const { store, result } = setup( useIsOnSale );

		act( () => {
			store.dispatch( receive( { security: true } ) );
		} );
		expect( result.current( 'jetpack_security_t1_yearly' ) ).toBe( true );
		expect( result.current( 'jetpack_starter_yearly' ) ).toBe( false );
	} );
} );

describe( 'useOnSaleStatus', () => {
	const useStatus = () => useOnSaleStatus( 'jetpack_security_t1_yearly' );

	it.each( [
		[ 'before launch', { security: true }, 'on-sale' ],
		[ 'after launch', { pro: true }, 'off-sale' ],
		[ 'after a Pro-only rollback', {}, 'off-sale' ],
	] )( 'follows the catalog %s', ( _, catalog, expected ) => {
		const { store, result } = setup( useStatus );

		act( () => {
			store.dispatch( receive( catalog ) );
		} );
		expect( result.current ).toBe( expected );
	} );

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
