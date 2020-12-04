/**
 * Internal dependencies
 */
import { handleRequestSuccess, requestUserProfileLinks } from '../';
import { USER_PROFILE_LINKS_RECEIVE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

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

describe( 'requestUserProfileLinks()', () => {
	test( 'should return an action for HTTP request to fetch the users profile links endpoint', () => {
		const action = requestUserProfileLinks();

		expect( action ).toEqual(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/settings/profile-links',
			} )
		);
	} );
} );

describe( 'handleRequestSuccess()', () => {
	test( 'should return a user profile links receive action', () => {
		const action = handleRequestSuccess( null, { profile_links: profileLinks } );

		expect( action ).toEqual( {
			type: USER_PROFILE_LINKS_RECEIVE,
			profileLinks,
		} );
	} );
} );
