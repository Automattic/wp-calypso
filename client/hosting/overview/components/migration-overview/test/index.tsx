/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import MigrationOverview from '..';
import type { SiteDetails } from '@automattic/data-stores';

const buildMigrationSite = ( {
	status,
	how,
	canInstallPlugins = false,
}: {
	status: string;
	how?: string;
	canInstallPlugins?: boolean;
} ) =>
	( {
		ID: 123,
		slug: 'example.com',
		site_migration: {
			migration_status: [ 'migration', status, how ].filter( Boolean ).join( '-' ),
		},
		name: 'Bold Apps',
		plan: {
			features: {
				active: canInstallPlugins ? [ 'install-plugins' ] : [],
			},
		},
	} ) as SiteDetails;

describe( 'MigrationOverview', () => {
	const getStartMigrationLink = () => {
		return screen.queryByRole( 'link', { name: 'Start your migration' } );
	};

	describe( 'DIY pending migration', () => {
		it( 'shows the migrating pending instructions', () => {
			const site = buildMigrationSite( { status: 'pending', how: 'diy' } );

			const { getByText } = render( <MigrationOverview site={ site } /> );

			expect(
				getByText( /Start your migration today and get ready for unmatched WordPress hosting./ )
			).toBeVisible();
		} );

		it( 'shows a link to the instructions page', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: true,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/hosted-site-migration/site-migration-instructions?siteId=123&siteSlug=example.com&ref=hosting-migration-overview'
			);
		} );
	} );

	describe( 'DIFM pending migration', () => {
		it( 'shows the migrating pending instructions', () => {
			const site = buildMigrationSite( { status: 'pending', how: 'difm' } );

			const { getByText } = render( <MigrationOverview site={ site } /> );

			expect(
				getByText( /Start your migration today and get ready for unmatched WordPress hosting./ )
			).toBeVisible();
		} );

		it( 'shows a link to the instructions page', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'difm',
				canInstallPlugins: true,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/hosted-site-migration/site-migration-credentials?siteId=123&siteSlug=example.com&ref=hosting-migration-overview'
			);
		} );
	} );

	describe( 'DIY started migration', () => {
		it( 'shows the migrating started instructions', () => {
			const site = buildMigrationSite( { status: 'started', how: 'diy' } );

			render( <MigrationOverview site={ site } /> );

			expect( screen.queryByText( /Your migration is underway/ ) ).toBeVisible();
		} );

		it( 'does not show the continue migration link', () => {
			const site = buildMigrationSite( { status: 'started', how: 'diy' } );

			render( <MigrationOverview site={ site } /> );

			expect( getStartMigrationLink() ).not.toBeInTheDocument();
		} );
	} );

	describe( 'DIFM started migration', () => {
		it( 'shows the migrating started instructions', () => {
			const site = buildMigrationSite( { status: 'started', how: 'difm' } );

			render( <MigrationOverview site={ site } /> );

			expect( screen.queryByText( /Your migration is underway/ ) ).toBeVisible();
		} );

		it( 'does not show the continue migration link', () => {
			const site = buildMigrationSite( { status: 'started', how: 'difm' } );

			render( <MigrationOverview site={ site } /> );

			expect( getStartMigrationLink() ).not.toBeInTheDocument();
		} );
	} );
} );
