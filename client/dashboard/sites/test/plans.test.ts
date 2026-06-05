import { DotcomPlans } from '@automattic/api-core';
import { isSitePlanBigSkyTrial, isSitePlanPaid } from '../plans';
import type { Site } from '@automattic/api-core';

const makeSite = ( productSlug: string ): Site =>
	( {
		launch_status: 'unlaunched',
		options: {
			site_creation_flow: 'ai-site-builder',
		},
		plan: {
			product_slug: productSlug,
		},
	} ) as Site;

describe( 'site plan helpers', () => {
	test( 'does not treat Student as a Big Sky trial plan', () => {
		expect( isSitePlanBigSkyTrial( makeSite( DotcomPlans.STUDENT ) ) ).toBe( false );
	} );

	test( 'treats Student as a paid plan', () => {
		expect( isSitePlanPaid( makeSite( DotcomPlans.STUDENT ) ) ).toBe( true );
	} );
} );
