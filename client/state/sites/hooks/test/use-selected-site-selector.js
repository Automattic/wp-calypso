import { FEATURE_WP_SUBDOMAIN } from '@automattic/calypso-products';
import * as redux from 'react-redux';
import hasAvailableSiteFeature from 'calypso/state/selectors/has-available-site-feature';
import { useSelectedSiteSelector } from '../';
import { isJetpackSite } from '../../selectors';

const useSelector = jest.spyOn( redux, 'useSelector' );

describe( 'useSelectedSiteSelector()', () => {
	test( 'executes selector with selected site id passed in', () => {
		const state = {
			sites: {
				items: {
					123: {
						jetpack: true,
					},
				},
			},
			ui: {
				selectedSiteId: 123,
			},
		};
		useSelector.mockImplementation( ( selector ) => selector( state ) );
		expect( useSelectedSiteSelector( isJetpackSite ) ).toBe( true );
	} );

	test( 'passes through rest params', () => {
		const state = {
			sites: {
				features: {
					123: {
						data: {
							available: {
								[ FEATURE_WP_SUBDOMAIN ]: true,
							},
						},
					},
				},
			},
			ui: {
				selectedSiteId: 123,
			},
		};
		useSelector.mockImplementation( ( selector ) => selector( state ) );
		expect( useSelectedSiteSelector( hasAvailableSiteFeature, FEATURE_WP_SUBDOMAIN ) ).toEqual(
			true
		);
	} );
} );
