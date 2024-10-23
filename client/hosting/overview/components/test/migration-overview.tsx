/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
import MigrationOverview from '../migration-overview';
import type { SiteDetails, SiteDetailsPlan } from '@automattic/data-stores';

jest.mock( 'calypso/sites-dashboard/utils' );
jest.mock( '@automattic/calypso-products' );

describe( 'MigrationOverview', () => {
	beforeEach( () => {
		( getMigrationStatus as jest.Mock ).mockReturnValue( 'pending' );
	} );

	it.each( [
		[
			'diy',
			false,
			'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=myself',
		],
		[
			'difm',
			false,
			'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=difm',
		],
		[
			undefined,
			false,
			'/setup/site-migration/site-migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			'diy',
			true,
			'/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			'difm',
			true,
			'/setup/migration/site-migration-credentials?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
		[
			undefined,
			true,
			'/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
		],
	] )(
		'should set continueMigrationUrl correctly for migrationType: %s and isFreePlan: %s',
		( migrationType, canInstallPlugins, expectedUrl ) => {
			( getMigrationType as jest.Mock ).mockReturnValue( migrationType );

			const site = {
				ID: 123,
				slug: 'example.com',
				plan: {
					features: { active: canInstallPlugins ? [ 'install-plugins' ] : [] },
				} as SiteDetailsPlan,
			} as SiteDetails;

			const { getByText } = render( <MigrationOverview site={ site } /> );
			const button = getByText( 'Start your migration' );

			expect( button ).toHaveAttribute( 'href', expectedUrl );
		}
	);
} );
