/**
 * Internal dependencies
 */
import isSiteInProfileLinks from 'calypso/state/selectors/is-site-in-profile-links';

describe( 'isSiteInProfileLinks()', () => {
	const profileLinks = [
		{
			link_slug: 'wordpress-org',
			title: 'WordPress.org',
			value: 'https://wordpress.org',
		},
	];

	test( 'should return null if profile links have not been received yet', () => {
		const state = {
			userProfileLinks: {
				items: null,
			},
		};

		expect( isSiteInProfileLinks( state, 'wordpress.org' ) ).toEqual( null );
	} );

	test( 'should return false if site is not in profile links', () => {
		const state = {
			userProfileLinks: {
				items: profileLinks,
			},
		};

		expect( isSiteInProfileLinks( state, 'wordpress.com' ) ).toBe( false );
	} );

	test( 'should return true if site is in profile links', () => {
		const state = {
			userProfileLinks: {
				items: profileLinks,
			},
		};

		expect( isSiteInProfileLinks( state, 'wordpress.org' ) ).toBe( true );
	} );
} );
