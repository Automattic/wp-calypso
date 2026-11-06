/**
 * @jest-environment jsdom
 */
import { DotcomFeatures } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import UpsellCallout from '../upsell';
import type { Site } from '@automattic/api-core';

const site = { ID: 1, slug: 'example.wordpress.com' } as Site;

const BUSINESS_COPY = 'Available on the WordPress.com Business and Commerce plans.';
const ANY_PAID_COPY = 'Available on WordPress.com paid plans.';

describe( '<UpsellCallout>', () => {
	afterEach( () => {
		config.disable( 'hosting/dev-tools-all-paid-plans' );
	} );

	describe( 'with hosting/dev-tools-all-paid-plans disabled', () => {
		it.each( [ DotcomFeatures.SFTP, DotcomFeatures.SSH, DotcomFeatures.GITHUB_DEPLOYMENTS ] )(
			'names the Business and Commerce plans for %s',
			async ( feature ) => {
				render( <UpsellCallout site={ site } upsellId="test" feature={ feature } /> );

				expect( await screen.findByText( BUSINESS_COPY ) ).toBeVisible();
			}
		);
	} );

	describe( 'with hosting/dev-tools-all-paid-plans enabled', () => {
		beforeEach( () => {
			config.enable( 'hosting/dev-tools-all-paid-plans' );
		} );

		it.each( [ DotcomFeatures.SFTP, DotcomFeatures.SSH, DotcomFeatures.GITHUB_DEPLOYMENTS ] )(
			'says %s is available on paid plans',
			async ( feature ) => {
				render( <UpsellCallout site={ site } upsellId="test" feature={ feature } /> );

				expect( await screen.findByText( ANY_PAID_COPY ) ).toBeVisible();
			}
		);

		it.each( [
			DotcomFeatures.STAGING_SITES,
			DotcomFeatures.MONITORING,
			DotcomFeatures.PERFORMANCE,
		] )( 'keeps the Business and Commerce copy for %s', async ( feature ) => {
			render( <UpsellCallout site={ site } upsellId="test" feature={ feature } /> );

			expect( await screen.findByText( BUSINESS_COPY ) ).toBeVisible();
		} );

		it( 'keeps an explicit plan requirement', async () => {
			render(
				<UpsellCallout
					site={ site }
					upsellId="test"
					feature={ DotcomFeatures.SFTP }
					upsellPlanRequirement="business-or-commerce"
				/>
			);

			expect( await screen.findByText( BUSINESS_COPY ) ).toBeVisible();
		} );
	} );
} );
