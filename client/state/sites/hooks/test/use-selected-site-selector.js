import { FEATURE_WP_SUBDOMAIN } from '@automattic/calypso-products';
import * as calypsoState from 'calypso/state';
import getPlansForFeature from 'calypso/state/selectors/get-plans-for-feature';
import { useSelectedSiteSelector } from '../';
import { isJetpackSite } from '../../selectors';

const useSelector = jest.spyOn( calypsoState, 'useSelector' );

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
		expect( useSelectedSiteSelector( getPlansForFeature, FEATURE_WP_SUBDOMAIN ) ).toEqual( true );
	} );
} );
