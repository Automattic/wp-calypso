/** @format */

/**
 * Internal dependencies
 */
import { requestUserProfileLinks, handleRequestSuccess } from '../';
import { USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'user profile links', () => {
		describe( 'requestUserProfileLinks()', () => {
			test( 'should dispatch HTTP request to the users profile links endpoint', () => {
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
			test( 'should dispatch user profile links updates', () => {
				const dispatch = jest.fn();
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

				handleRequestSuccess( { dispatch }, null, { profile_links: profileLinks } );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( {
					type: USER_PROFILE_LINKS_RECEIVE,
					profileLinks,
				} );
			} );
		} );
	} );
} );
