import isJetpackSeoPageAvailable from 'calypso/state/selectors/is-jetpack-seo-page-available';
import { getBlazeAdvertisingUrl, shouldShowBlazeAdvertisingOption } from '../traffic';

const siteId = 123;

const getState = ( {
	adminMenu,
	canBlaze,
	isComingSoon = false,
	isSiteKnown = true,
	siteSettingsComingSoon = false,
} ) => {
	const site = {
		ID: siteId,
		URL: 'https://example.wordpress.com',
		is_coming_soon: isComingSoon,
		options: {
			can_blaze: canBlaze,
			is_wpcom_simple: true,
		},
	};

	return {
		adminMenu: {
			menus: adminMenu ? { [ siteId ]: adminMenu } : {},
		},
		sites: {
			items: isSiteKnown ? { [ siteId ]: site } : {},
		},
		siteSettings: {
			items: {
				[ siteId ]: {
					wpcom_coming_soon: siteSettingsComingSoon ? 1 : 0,
				},
			},
		},
	};
};

describe( 'shouldShowBlazeAdvertisingOption', () => {
	test( 'returns true when the site can use Blaze', () => {
		const state = getState( { canBlaze: true } );

		expect( shouldShowBlazeAdvertisingOption( state, siteId ) ).toBe( true );
	} );

	test( 'returns true when the site is coming soon', () => {
		const state = getState( { canBlaze: false, isComingSoon: true } );

		expect( shouldShowBlazeAdvertisingOption( state, siteId ) ).toBe( true );
	} );

	test( 'returns true when site settings identify the site as coming soon', () => {
		const state = getState( {
			canBlaze: false,
			isSiteKnown: false,
			siteSettingsComingSoon: true,
		} );

		expect( shouldShowBlazeAdvertisingOption( state, siteId ) ).toBe( true );
	} );

	test( 'returns false when the site cannot use Blaze and is not coming soon', () => {
		const state = getState( { canBlaze: false } );

		expect( shouldShowBlazeAdvertisingOption( state, siteId ) ).toBe( false );
	} );
} );

describe( 'getBlazeAdvertisingUrl', () => {
	test( 'returns the Calypso Advertising route when the site slug is available', () => {
		expect(
			getBlazeAdvertisingUrl( {
				siteSlug: 'example.wordpress.com',
				wpAdminAdvertisingUrl: 'https://example.wordpress.com/wp-admin/tools.php?page=advertising',
			} )
		).toBe( '/advertising/example.wordpress.com' );
	} );

	test( 'returns the wp-admin Advertising URL as a fallback', () => {
		const wpAdminAdvertisingUrl =
			'https://example.wordpress.com/wp-admin/tools.php?page=advertising';

		expect(
			getBlazeAdvertisingUrl( {
				siteSlug: null,
				wpAdminAdvertisingUrl,
			} )
		).toBe( wpAdminAdvertisingUrl );
	} );
} );

describe( 'isJetpackSeoPageAvailable', () => {
	const getJetpackMenu = ( childSlugs ) => [
		{ slug: 'index-php', children: [ { parent: 'index.php', slug: 'index-php' } ] },
		{
			slug: 'jetpack',
			children: childSlugs.map( ( slug ) => ( { parent: 'jetpack', slug } ) ),
		},
	];

	test( 'returns true when the admin menu lists the Jetpack SEO page', () => {
		const state = getState( { adminMenu: getJetpackMenu( [ 'stats', 'jetpack-seo' ] ) } );

		expect( isJetpackSeoPageAvailable( state, siteId ) ).toBe( true );
	} );

	test( 'returns false when the admin menu does not list the Jetpack SEO page', () => {
		const state = getState( { adminMenu: getJetpackMenu( [ 'stats' ] ) } );

		expect( isJetpackSeoPageAvailable( state, siteId ) ).toBe( false );
	} );

	test( 'returns false when the admin menu has not loaded', () => {
		const state = getState( {} );

		expect( isJetpackSeoPageAvailable( state, siteId ) ).toBe( false );
	} );
} );
