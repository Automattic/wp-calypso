import * as redux from 'react-redux';
import { useSiteOptions } from '../';

const useSelector = jest.spyOn( redux, 'useSelector' );

describe( '#useSiteOptions()', () => {
	afterEach( () => {
		useSelector.mockReset();
	} );

	test( 'should return null if the site is not known', () => {
		const state = {
			sites: {
				items: {},
			},
			ui: {},
		};

		useSelector.mockImplementation( ( selector ) => selector( state ) );

		expect( useSiteOptions( [ 'site_intent' ] ) ).toEqual( {
			siteIntent: null,
		} );
	} );

	test( 'executes selector with selected site id passed in', () => {
		const siteIntent = 'site_intent';
		const state = {
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
		};

		useSelector.mockImplementation( ( selector ) => selector( state ) );

		expect( useSiteOptions( [ 'site_intent' ] ) ).toEqual( {
			siteIntent,
		} );
	} );
} );
