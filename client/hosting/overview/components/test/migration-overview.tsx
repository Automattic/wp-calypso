/**
 * @jest-environment jsdom
 */
import { canInstallPlugins } from '@automattic/sites';
import { render, within } from '@testing-library/react';
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

	it( 'should not render the button if it is not in the pending status', () => {
		( getMigrationType as jest.Mock ).mockReturnValue( 'diy' );
		( getMigrationStatus as jest.Mock ).mockReturnValue( 'started' );
		( canInstallPlugins as jest.Mock ).mockReturnValue( true );

		const { queryByRole } = render( <MigrationOverview site={ baseSite } /> );
		expect( queryByRole( 'link', { name: 'Start your migration' } ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[
			'pending',
			'Your WordPress site is ready to be migrated',
			'Start your migration today and get ready for unmatched WordPress hosting.',
		],
		[
			'started',
			'Your migration is underway',
			/transfers to its new home. Get ready for unmatched WordPress hosting./,
		],
	] )(
		'should render the correct title and paragraph for migration status: %s',
		( migrationStatus, expectedTitle, expectedParagraph ) => {
			( getMigrationType as jest.Mock ).mockReturnValue( 'diy' );
			( getMigrationStatus as jest.Mock ).mockReturnValue( migrationStatus );

			const { getByText } = render( <MigrationOverview site={ baseSite } /> );
			expect( getByText( expectedTitle ) ).toBeInTheDocument();
			expect( getByText( expectedParagraph ) ).toBeInTheDocument();
		}
	);

	it( 'should render the correct paragraph for a site without a name', () => {
		( getMigrationType as jest.Mock ).mockReturnValue( 'diy' );
		( getMigrationStatus as jest.Mock ).mockReturnValue( 'started' );

		const { container } = render( <MigrationOverview site={ baseSite } /> );
		const hostingHero = container.querySelector( '.hosting-hero' ) as HTMLElement;
		expect( within( hostingHero ).getByText( /your site/i ) ).toBeInTheDocument();
	} );

	it( 'should render the correct paragraph for a site with a name', () => {
		( getMigrationType as jest.Mock ).mockReturnValue( 'diy' );
		( getMigrationStatus as jest.Mock ).mockReturnValue( 'started' );

		const site = { ...baseSite, name: 'My Site' };

		const { getByText } = render( <MigrationOverview site={ site } /> );
		expect( getByText( /My Site/i ) ).toBeInTheDocument();
	} );
} );
