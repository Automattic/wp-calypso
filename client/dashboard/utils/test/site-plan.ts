import { getSitePlanDisplayName } from '../site-plan';
import type { Site } from '@automattic/api-core';

describe( 'getSitePlanDisplayName', () => {
	test( 'for staging sites, it renders "Staging Site"', () => {
		const site = {
			is_wpcom_staging_site: true,
		} as Site;
		expect( getSitePlanDisplayName( site ) ).toBe( 'Staging Site' );
	} );

	test( 'for self-hosted, Jetpack-connected sites, active Jetpack plugin, it renders the plan name', () => {
		const site = {
			is_wpcom_atomic: false,
			jetpack_connection: true,
			jetpack: true,
			plan: {
				product_name_short: 'Free',
			},
		} as Site;
		expect( getSitePlanDisplayName( site ) ).toBe( 'Free' );
	} );
} );
