/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { PRODUCTS_LIST_RECEIVE } from 'calypso/state/action-types';
import productsList from 'calypso/state/products-list/reducer';
import useIsOnSale from '../use-is-on-sale';
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
	const { result } = renderHook( () => useIsOnSale(), { wrapper } );
	return { store, result };
};

const receive = ( available: boolean ) => ( {
	type: PRODUCTS_LIST_RECEIVE,
	productsList: {
		jetpack_pro_yearly: { available },
		jetpack_starter_yearly: { available: false },
		jetpack_security_t1_yearly: { available: false },
	},
	productsListType: 'jetpack',
	isPartialList: false,
} );

describe( 'useIsOnSale', () => {
	it( 'hides Pro until the list says it is on sale', () => {
		const { store, result } = setup();
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( false );

		act( () => {
			store.dispatch( receive( true ) );
		} );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( true );
	} );

	it( 'keeps Pro hidden while it is off sale', () => {
		const { store, result } = setup();

		act( () => {
			store.dispatch( receive( false ) );
		} );
		expect( result.current( 'jetpack_pro_yearly' ) ).toBe( false );
	} );

	it.each( [ 'jetpack_starter_yearly', 'jetpack_security_t1_yearly', 'jetpack_complete' ] )(
		'offers %s whatever the list says',
		( slug ) => {
			const { store, result } = setup();
			expect( result.current( slug ) ).toBe( true );

			act( () => {
				store.dispatch( receive( false ) );
			} );
			expect( result.current( slug ) ).toBe( true );
		}
	);
} );
