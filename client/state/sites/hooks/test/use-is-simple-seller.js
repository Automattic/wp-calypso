import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useIsSimpleSeller } from '../';

const createDummyStore = ( initialState ) => createStore( ( state ) => state, initialState );

describe( '#useIsSimpleSeller()', () => {
	it( 'should return false if the site is not known', () => {
		const store = createDummyStore( {
			sites: {
				items: {},
			},
			ui: {},
		} );

		const { result } = renderHook( () => useIsSimpleSeller(), {
			wrapper: Provider,
			initialProps: { store },
		} );

		expect( result.current ).toBe( false );
	} );

	it( 'should return true with the sell intent and the free plan', () => {
		const store = createDummyStore( {
			sites: {
				items: {
					123: {
						options: {
							site_intent: 'sell',
						},
					},
				},
				plans: {
					123: {
						data: [
							{
								planSlug: 'free_plan',
							},
						],
					},
				},
			},
			ui: {
				selectedSiteId: 123,
			},
		} );

		const { result } = renderHook( () => useIsSimpleSeller(), {
			wrapper: Provider,
			initialProps: { store },
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'should return false with the sell intent and an ecomm plan', () => {
		const store = createDummyStore( {
			sites: {
				items: {
					123: {
						options: {
							site_intent: 'sell',
						},
					},
				},
				plans: {
					123: {
						data: [
							{
								planSlug: 'ecommerce-bundle',
							},
						],
					},
				},
			},
			ui: {
				selectedSiteId: 123,
			},
		} );

		const { result } = renderHook( () => useIsSimpleSeller(), {
			wrapper: Provider,
			initialProps: { store },
		} );

		expect( result.current ).toBe( true );
	} );
} );
