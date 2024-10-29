/**
 * @jest-environment jsdom
 */
import { canInstallPlugins } from '@automattic/sites';
import { render } from '@testing-library/react';
import React from 'react';
import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
import MigrationOverview from '../migration-overview';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/sites' );
jest.mock( 'calypso/sites-dashboard/utils' );

const baseSite = {
	ID: 123,
	slug: 'example.com',
} as SiteDetails;

describe( 'MigrationOverview', () => {
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
			'/setup/migration/site-migration-instructions?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview',
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
		( migrationType, siteCanInstallPlugins, expectedUrl ) => {
			( getMigrationType as jest.Mock ).mockReturnValue( migrationType );
			( getMigrationStatus as jest.Mock ).mockReturnValue( 'pending' );
			( canInstallPlugins as jest.Mock ).mockReturnValue( siteCanInstallPlugins );

			const { getByRole } = render( <MigrationOverview site={ baseSite } /> );
			const button = getByRole( 'link', { name: 'Start your migration' } );

			expect( button ).toHaveAttribute( 'href', expectedUrl );
		}
	);
} );
