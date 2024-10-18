/**
 * @jest-environment jsdom
 */
import { isFreePlanProduct, PLAN_FREE } from '@automattic/calypso-products';
import { render } from '@testing-library/react';
import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
import MigrationOverview from '../migration-overview';
import type { SiteDetails, SiteDetailsPlan } from '@automattic/data-stores';

jest.mock( 'calypso/sites-dashboard/utils' );
jest.mock( '@automattic/calypso-products' );

describe( 'MigrationOverview', () => {
	const site = {
		ID: 123,
		slug: 'example.com',
		plan: { product_slug: PLAN_FREE } as SiteDetailsPlan,
	} as SiteDetails;

	beforeEach( () => {
		( getMigrationStatus as jest.Mock ).mockReturnValue( 'pending' );
	} );

	it.each( [
		[
			'diy',
			true,
			'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=myself',
		],
		[
			'difm',
			true,
			'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=difm',
		],
		[
			undefined,
			true,
			'/setup/site-migration/site-migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			'diy',
			false,
			'/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			'difm',
			false,
			'/setup/migration/site-migration-credentials?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			undefined,
			false,
			'/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
	] )(
		'should set continueMigrationUrl correctly for migrationType: %s and isFreePlan: %s',
		( migrationType, isFreePlan, expectedUrl ) => {
			( getMigrationType as jest.Mock ).mockReturnValue( migrationType );
			( isFreePlanProduct as jest.Mock ).mockReturnValue( isFreePlan );

			const { getByText } = render( <MigrationOverview site={ site } /> );
			const button = getByText( 'Start your migration' );

			expect( button ).toHaveAttribute( 'href', expectedUrl );
		}
	);
} );
