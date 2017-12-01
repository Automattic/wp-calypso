/** @format */

/**
 * Internal dependencies
 */
import { handleRequestSuccess, requestUserProfileLinks } from '../';
import { USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

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
	test( 'should dispatch HTTP request to fetch the users profile links endpoint', () => {
		const dispatch = jest.fn();

		requestUserProfileLinks( { dispatch } );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/settings/profile-links',
			} )
		);
	} );
} );

describe( 'handleRequestSuccess()', () => {
	test( 'should dispatch user profile links receive action', () => {
		const dispatch = jest.fn();

		handleRequestSuccess( { dispatch }, null, { profile_links: profileLinks } );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: USER_PROFILE_LINKS_RECEIVE,
			profileLinks,
		} );
	} );
} );
