import { buildAdminSidebarDevMock } from '../admin-sidebar-dev-mock';

describe( 'buildAdminSidebarDevMock()', () => {
	it( 'groups the first three non-core leaf items', () => {
		const { menuItems, groups } = buildAdminSidebarDevMock( [
			{ slug: 'dashboard', title: 'Dashboard', type: 'menu-item' },
			{ slug: 'yoast-seo', title: 'Yoast SEO', type: 'menu-item' },
			{ slug: 'woocommerce', title: 'WooCommerce', type: 'menu-item' },
			{ slug: 'sensei-lms', title: 'Sensei LMS', type: 'menu-item' },
			{ slug: 'jetpack', title: 'Jetpack', type: 'menu-item' },
		] );

		expect( groups ).toEqual( [
			{
				id: 'plugins',
				label: 'My Plugins',
				default_expanded: false,
				signal: { attention: true, count: 3 },
			},
		] );
		expect( menuItems.map( ( item ) => item.group_id ) ).toEqual( [
			undefined,
			'plugins',
			'plugins',
			'plugins',
			undefined,
		] );
		expect( menuItems[ 1 ].itemId ).toBe( 'mock:menu:plugins:yoast-seo' );
		expect( menuItems[ 1 ].signal ).toMatchObject( { count: 3, attention: true } );
		expect( menuItems[ 2 ].signal ).toMatchObject( {
			inline_text: 'Premium',
			attention: false,
		} );
	} );

	it( 'preserves child-bearing non-core items as grouped mock rows', () => {
		const { menuItems } = buildAdminSidebarDevMock( [
			{ slug: 'dashboard', title: 'Dashboard', type: 'menu-item' },
			{
				slug: 'jetpack',
				title: 'Jetpack',
				type: 'menu-item',
				children: [ { slug: 'jetpack-backup', title: 'Backup' } ],
			},
			{ slug: 'stats', title: 'Stats', type: 'menu-item' },
		] );

		const groupedItems = menuItems.filter( ( item ) => item.group_id === 'plugins' );
		expect( groupedItems ).toHaveLength( 3 );
		expect( groupedItems[ 0 ] ).toMatchObject( {
			slug: 'jetpack',
			children: [ { slug: 'jetpack-backup', title: 'Backup' } ],
			reassignable: true,
		} );
		expect( groupedItems[ 1 ].slug ).toBe( 'stats' );
		expect( groupedItems[ 2 ].slug ).toBe( 'mock-plugin-forms' );
	} );

	it( 'keeps exempt host links ungrouped and non-reassignable', () => {
		const { menuItems } = buildAdminSidebarDevMock( [
			{
				slug: 'plugins',
				title: 'Plugins',
				type: 'menu-item',
				group_id: 'plugins',
				reassignable: true,
			},
			{
				slug: 'stats',
				title: 'Stats',
				type: 'menu-item',
				group_id: 'plugins',
				reassignable: true,
			},
		] );

		expect( menuItems[ 0 ] ).toMatchObject( {
			slug: 'plugins',
			group_id: null,
			reassignable: false,
		} );
		expect( menuItems[ 1 ] ).toMatchObject( {
			slug: 'stats',
			group_id: 'plugins',
			reassignable: true,
		} );
	} );
} );
