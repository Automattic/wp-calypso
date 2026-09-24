import { isSiteEligibleForDIFMPurchase } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';

describe( 'isSiteEligibleForDIFMPurchase', () => {
	const site = {
		capabilities: { manage_options: true },
		is_wpcom_atomic: true,
		jetpack: false,
		options: {},
	} as SiteDetails;

	it( 'allows eligible production sites', () => {
		expect( isSiteEligibleForDIFMPurchase( site ) ).toBe( true );
	} );

	it( 'does not allow staging sites', () => {
		expect( isSiteEligibleForDIFMPurchase( { ...site, is_wpcom_staging_site: true } ) ).toBe(
			false
		);
	} );

	it( 'does not allow sites with an active DIFM build', () => {
		expect(
			isSiteEligibleForDIFMPurchase( {
				...site,
				options: { is_difm_lite_in_progress: true },
			} )
		).toBe( false );
	} );
} );
