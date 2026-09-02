import {
	isSiteInSubscribersWpAdminLinkBucket,
	rewriteSubscribersMenuLink,
} from '../subscribers-wp-admin-link';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

const WP_ADMIN_URL = 'https://example.com/wp-admin/admin.php?page=jetpack-subscribers';

const buildMenu = (): AdminMenuItem[] => [
	{ slug: 'home', title: 'Home', type: 'menu-item', url: '/home/example.com' },
	{
		slug: 'users-php',
		title: 'Users',
		type: 'menu-item',
		url: '/people/team/example.com',
		children: [
			{
				slug: 'users-all-people',
				title: 'All Users',
				type: 'submenu-item',
				url: '/people/team/example.com',
			},
			{
				slug: 'subscribers',
				title: 'Subscribers',
				type: 'submenu-item',
				url: '/subscribers/example.com',
			},
		],
	},
];

describe( 'isSiteInSubscribersWpAdminLinkBucket()', () => {
	it( 'includes ~10% of sites keyed on the site id', () => {
		expect( isSiteInSubscribersWpAdminLinkBucket( 10 ) ).toBe( true );
		expect( isSiteInSubscribersWpAdminLinkBucket( 120 ) ).toBe( true );
		expect( isSiteInSubscribersWpAdminLinkBucket( 11 ) ).toBe( false );
		expect( isSiteInSubscribersWpAdminLinkBucket( 7 ) ).toBe( false );
	} );

	it( 'is deterministic for a given site id', () => {
		expect( isSiteInSubscribersWpAdminLinkBucket( 30 ) ).toBe(
			isSiteInSubscribersWpAdminLinkBucket( 30 )
		);
	} );

	it( 'returns false for non-integer ids', () => {
		expect( isSiteInSubscribersWpAdminLinkBucket( null ) ).toBe( false );
		expect( isSiteInSubscribersWpAdminLinkBucket( undefined ) ).toBe( false );
		expect( isSiteInSubscribersWpAdminLinkBucket( 10.5 ) ).toBe( false );
	} );
} );

describe( 'rewriteSubscribersMenuLink()', () => {
	it( 'rewrites the nested Subscribers item URL', () => {
		const result = rewriteSubscribersMenuLink( buildMenu(), WP_ADMIN_URL );
		const subscribers = result[ 1 ].children?.find( ( item ) => item.slug === 'subscribers' );
		expect( subscribers?.url ).toBe( WP_ADMIN_URL );
	} );

	it( 'leaves every other item untouched', () => {
		const result = rewriteSubscribersMenuLink( buildMenu(), WP_ADMIN_URL );
		expect( result[ 0 ].url ).toBe( '/home/example.com' );
		expect( result[ 1 ].url ).toBe( '/people/team/example.com' );
		const allUsers = result[ 1 ].children?.find( ( item ) => item.slug === 'users-all-people' );
		expect( allUsers?.url ).toBe( '/people/team/example.com' );
	} );

	it( 'returns the input unchanged when there is no Subscribers item', () => {
		const menu: AdminMenuItem[] = [
			{ slug: 'home', title: 'Home', type: 'menu-item', url: '/home/example.com' },
		];
		const result = rewriteSubscribersMenuLink( menu, WP_ADMIN_URL );
		expect( result ).toEqual( menu );
	} );

	it( 'is a no-op when the Subscribers item already points at the wp-admin URL', () => {
		const menu = rewriteSubscribersMenuLink( buildMenu(), WP_ADMIN_URL );
		const again = rewriteSubscribersMenuLink( menu, WP_ADMIN_URL );
		const subscribers = again[ 1 ].children?.find( ( item ) => item.slug === 'subscribers' );
		expect( subscribers?.url ).toBe( WP_ADMIN_URL );
	} );

	it( 'returns an empty array for non-array input', () => {
		expect( rewriteSubscribersMenuLink( null, WP_ADMIN_URL ) ).toEqual( [] );
		expect( rewriteSubscribersMenuLink( undefined, WP_ADMIN_URL ) ).toEqual( [] );
	} );
} );
