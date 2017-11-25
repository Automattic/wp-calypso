/** @format */

/**
 * Internal dependencies
 */
import { requestUserProfileLinks, userProfileLinksReceive } from '../actions';
import { USER_PROFILE_LINKS_REQUEST, USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';

describe( 'actions', () => {
	describe( 'requestUserProfileLinks()', () => {
		test( 'should return a user profile links request action object', () => {
			const action = requestUserProfileLinks();

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_REQUEST,
			} );
		} );
	} );

	describe( 'userProfileLinksReceive()', () => {
		test( 'should return a user profile links receive action object', () => {
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
			const action = userProfileLinksReceive( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks,
			} );
		} );
	} );
} );
