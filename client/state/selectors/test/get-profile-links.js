/**
 * Internal dependencies
 */
import getProfileLinks from 'calypso/state/selectors/get-profile-links';

describe( 'getProfileLinks()', () => {
	const profileLinks = [
		{
			link_slug: 'wordpress-org',
			title: 'WordPress.org',
			value: 'https://wordpress.org/',
		},
		{
			link_slug: 'wordpress-com',
			title: 'WordPress.com',
			value: 'https://wordpress.com/',
		},
	];

	test( 'should return null if profile links have not been received yet', () => {
		const state = {
			userProfileLinks: {
				items: null,
			},
		};
		expect( getProfileLinks( state ) ).toEqual( null );
	} );

	test( 'should return empty array if current user has no profile links', () => {
		const state = {
			userProfileLinks: {
				items: [],
			},
		};
		expect( getProfileLinks( state ) ).toEqual( [] );
	} );

	test( 'should return the profile links of the current user', () => {
		const state = {
			userProfileLinks: {
				items: profileLinks,
			},
		};
		expect( getProfileLinks( state ) ).toEqual( profileLinks );
	} );
} );
