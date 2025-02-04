/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useSiteOption } from '../';

const createDummyStore = ( initialState ) => createStore( ( state ) => state, initialState );

describe( '#useSiteOption()', () => {
	it( 'should return null if the site is not known', () => {
		const store = createDummyStore( {
			sites: {
				items: {},
			},
			ui: {},
		} );

		const { result } = renderHook( () => useSiteOption( 'site_intent' ), {
			wrapper: ( props ) => <Provider store={ store } { ...props } />,
		} );

		expect( result.current ).toBe( null );
	} );

	it( 'should return the site intent of the selected site', () => {
		const siteIntent = 'site_intent';
		const store = createDummyStore( {
			sites: {
				items: {
					123: {
						options: {
							site_intent: siteIntent,
						},
					},
				},
			},
			ui: {
				selectedSiteId: 123,
			},
		} );

		const { result } = renderHook( () => useSiteOption( 'site_intent' ), {
			wrapper: ( props ) => <Provider store={ store } { ...props } />,
		} );

		expect( result.current ).toBe( siteIntent );
	} );
} );
