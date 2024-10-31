/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import MigrationOverview from '..';
import type { SiteDetails } from '@automattic/data-stores';

function textContentMatcher( textMatch: string | RegExp ) {
	const hasText =
		typeof textMatch === 'string'
			? ( node: Element ) => node.textContent === textMatch
			: ( node: Element ) => textMatch.test( node.textContent ?? '' );

	return ( _content: string, node: Element | null ) => {
		if ( ! node || ! hasText( node ) ) {
			return false;
		}

		const childrenDontHaveText = Array.from( node?.children || [] ).every(
			( child ) => ! hasText( child )
		);

		return childrenDontHaveText;
	};
}

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

		it( 'shows a link to the upgrade plan page when the site cannot install plugins', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: false,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=myself'
			);
		} );

		it( 'shows a link to the instructions page when the site is able to install plugins', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'diy',
				canInstallPlugins: true,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/migration/site-migration-instructions?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview'
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

		it( 'shows a link to the upgrade plan page when the site cannot install plugins', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'difm',
				canInstallPlugins: false,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/site-migration/site-migration-upgrade-plan?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview&destination=upgrade&how=difm'
			);
		} );

		it( 'shows a link to the instructions page when the site is able to install plugins', () => {
			const site = buildMigrationSite( {
				status: 'pending',
				how: 'difm',
				canInstallPlugins: true,
			} );

			render( <MigrationOverview site={ site } /> );

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/migration/site-migration-credentials?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview'
			);
		} );
	} );

	describe( 'DIY started migration', () => {
		it( 'shows the migrating started instructions', () => {
			const site = buildMigrationSite( { status: 'started', how: 'diy' } );

			render( <MigrationOverview site={ site } /> );

			expect( screen.queryByText( /Your migration is underway/ ) ).toBeVisible();
			expect(
				screen.queryByText(
					textContentMatcher(
						/Sit back as Bold Apps transfers to its new home. Get ready for unmatched WordPress hosting./
					)
				)
			).toBeVisible();
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
			expect(
				screen.queryByText(
					textContentMatcher(
						/Sit back as Bold Apps transfers to its new home. Here’s what you can expect./
					)
				)
			).toBeVisible();
		} );

		it( 'does not show the continue migration link', () => {
			const site = buildMigrationSite( { status: 'started', how: 'difm' } );

			render( <MigrationOverview site={ site } /> );

			expect( getStartMigrationLink() ).not.toBeInTheDocument();
		} );
	} );

	describe( 'no migration strategy was selected', () => {
		it( 'shows the how to migrate page', () => {
			const site = buildMigrationSite( { status: 'pending', how: undefined } );

			render( <MigrationOverview site={ site } /> );

			expect( screen.queryByText( /Your WordPress site is ready to be migrated?/ ) ).toBeVisible();
			expect(
				screen.queryByText(
					/Start your migration today and get ready for unmatched WordPress hosting./
				)
			).toBeVisible();

			const link = getStartMigrationLink();

			expect( link ).toHaveAttribute(
				'href',
				'/setup/site-migration/site-migration-how-to-migrate?siteId=123&siteSlug=example.com&start=true&ref=hosting-migration-overview'
			);
		} );
	} );
} );
