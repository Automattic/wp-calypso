import { addStatsNodeToSiteMenu, canSiteUserAccessStats } from '../stats';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

const siteNode: AdminBarNode = {
	id: 'site-name',
	title: 'Example',
	parent: false,
	href: 'https://example.wordpress.com',
	group: false,
};

const dashboardNode: AdminBarNode = {
	id: 'dashboard',
	title: 'Dashboard',
	parent: 'site-name',
	href: 'https://example.wordpress.com/wp-admin/',
	group: false,
	meta: {
		menu_title: 'Dashboard',
	},
};

const widgetsNode: AdminBarNode = {
	id: 'widgets',
	title: 'Widgets',
	parent: 'site-name',
	href: 'https://example.wordpress.com/wp-admin/widgets.php',
	group: false,
};

describe( 'addStatsNodeToSiteMenu', () => {
	test( 'adds Stats to the site dropdown', () => {
		const nodes = [ siteNode, dashboardNode, widgetsNode ];
		const result = addStatsNodeToSiteMenu( nodes, true );

		expect( result.map( ( node ) => node.id ) ).toContain( 'stats' );
		expect( result.find( ( node ) => node.id === 'stats' ) ).toMatchObject( {
			id: 'stats',
			title: 'Stats',
			parent: 'site-name',
			href: 'https://example.wordpress.com/wp-admin/admin.php?page=stats',
			group: false,
			meta: {
				menu_title: 'Stats',
			},
		} );
	} );

	test( 'returns the original nodes when Dashboard is missing', () => {
		const nodes = [ siteNode, widgetsNode ];

		expect( addStatsNodeToSiteMenu( nodes, true ) ).toBe( nodes );
	} );

	test( 'does not duplicate an existing Stats node', () => {
		const statsNode: AdminBarNode = {
			id: 'stats',
			title: 'Stats',
			parent: 'site-name',
			href: 'https://example.wordpress.com/wp-admin/admin.php?page=stats',
			group: false,
		};
		const nodes = [ siteNode, dashboardNode, statsNode, widgetsNode ];

		expect( addStatsNodeToSiteMenu( nodes, true ) ).toBe( nodes );
	} );

	test( 'returns the original nodes when the user cannot view stats', () => {
		const nodes = [ siteNode, dashboardNode, widgetsNode ];

		expect( addStatsNodeToSiteMenu( nodes, false ) ).toBe( nodes );
	} );
} );

describe( 'canSiteUserAccessStats', () => {
	test( 'returns true when view_stats is available', () => {
		expect(
			canSiteUserAccessStats( {
				capabilities: {
					view_stats: true,
				},
			} as Site )
		).toBe( true );
	} );

	test( 'returns true when manage_options is available', () => {
		expect(
			canSiteUserAccessStats( {
				capabilities: {
					manage_options: true,
				},
			} as Site )
		).toBe( true );
	} );

	test( 'returns false when the site is missing stats access capabilities', () => {
		expect(
			canSiteUserAccessStats( {
				capabilities: {
					update_plugins: true,
				},
			} as Site )
		).toBe( false );
	} );
} );
