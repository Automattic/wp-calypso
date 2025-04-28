/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSiteMigrationKey } from 'calypso/landing/stepper/hooks/use-site-migration-key';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
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

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-migration-key', () => ( {
	useSiteMigrationKey: jest.fn(),
} ) );

const render = ( ui: React.ReactElement ) => renderWithProvider( ui );

describe( 'MigrationOverview', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const getStartDIYMigrationLink = () => {
		return screen.queryByRole( 'link', { name: 'Complete migration' } );
	};

	const getStartDIFMMigrationLink = () => {
		return screen.queryByRole( 'link', { name: 'Start your migration' } );
	};

	describe( 'DIY pending migration', () => {
		it( 'shows the migration pending instructions', () => {
			const site = buildMigrationSite( { status: 'pending', how: 'diy' } );

			jest.mocked( useSiteMigrationKey ).mockReturnValue( {
				data: { migrationKey: '123' },
				isLoading: false,
				isError: false,
				error: null,
				status: 'success',
			} );

			const { getByText } = renderWithProvider( <MigrationOverview site={ site } /> );

			expect(
				getByText(
					/Get ready for unmatched WordPress hosting. Use your migration key to complete your migration in the/
				)
			).toBeVisible();
		} );

		it( 'shows a link to the instructions page', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: true,
			} );

			jest.mocked( useSiteMigrationKey ).mockReturnValue( {
				data: { migrationKey: '123' },
				isLoading: false,
				isError: false,
				error: null,
				status: 'success',
			} );

			renderWithProvider( <MigrationOverview site={ site } /> );

			const link = getStartDIYMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/site-migration/site-migration-instructions?siteId=123&siteSlug=example.com&ref=hosting-migration-overview'
			);
		} );

		it( 'shows a link to copy the migration key if we have a migration key', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: true,
			} );

			jest.mocked( useSiteMigrationKey ).mockReturnValue( {
				data: { migrationKey: '123' },
				isLoading: false,
				isError: false,
				error: null,
				status: 'success',
			} );

			const { getByText } = renderWithProvider( <MigrationOverview site={ site } /> );

			expect( getByText( /Copy migration key/ ) ).toBeVisible();
		} );

		it( 'shows a success notice if the migration key is copied', async () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: true,
			} );

			jest.mocked( useSiteMigrationKey ).mockReturnValue( {
				data: { migrationKey: '123' },
				isLoading: false,
				isError: false,
				error: null,
				status: 'success',
			} );

			renderWithProvider( <MigrationOverview site={ site } /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Copy migration key' } ) );

			await waitFor( () => {
				const notice = screen.getByText( 'Migration key copied successfully' );
				expect( notice ).toBeInTheDocument();
			} );
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

			const link = getStartDIFMMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/site-migration/site-migration-credentials?siteId=123&siteSlug=example.com&ref=hosting-migration-overview'
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

			expect( getStartDIYMigrationLink() ).not.toBeInTheDocument();
		} );
	} );

	describe( 'DIFM started migration', () => {
		it( 'shows the migrating started instructions', () => {
			const site = buildMigrationSite( { status: 'started', how: 'difm' } );

			const { getByText } = render( <MigrationOverview site={ site } /> );

			expect( getByText( /We've received your migration request/ ) ).toBeVisible();
			expect(
				getByText(
					/We will review your site to make sure we have everything we need. Here's what you can expect next:/
				)
			).toBeVisible();
		} );

		it( 'does not show the continue migration link', () => {
			const site = buildMigrationSite( { status: 'started', how: 'difm' } );

			render( <MigrationOverview site={ site } /> );

			expect( getStartDIFMMigrationLink() ).not.toBeInTheDocument();
		} );
	} );
} );
