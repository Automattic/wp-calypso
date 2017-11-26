/** @format */

/**
 * Internal dependencies
 */
import {
	addUserProfileLinks,
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	receiveUserProfileLinks,
	requestUserProfileLinks,
	resetUserProfileLinkErrors,
} from '../actions';
import {
	USER_PROFILE_LINKS_ADD,
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_REQUEST,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'state/action-types';

describe( 'actions', () => {
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
		test( 'should return a user profile links request action object', () => {
			const action = requestUserProfileLinks();

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_REQUEST,
			} );
		} );
	} );

	describe( 'receiveUserProfileLinks()', () => {
		test( 'should return a user profile links receive action object', () => {
			const action = receiveUserProfileLinks( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks,
			} );
		} );
	} );

	describe( 'addUserProfileLinks()', () => {
		test( 'should return a user profile links add action object', () => {
			const action = addUserProfileLinks( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_ADD,
				profileLinks,
			} );
		} );
	} );

	describe( 'addUserProfileLinksDuplicate()', () => {
		test( 'should return a user profile links add duplicate action object', () => {
			const action = addUserProfileLinksDuplicate( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_ADD_DUPLICATE,
				profileLinks,
			} );
		} );
	} );

	describe( 'addUserProfileLinksError()', () => {
		test( 'should return a user profile links add error action object', () => {
			const error = {
				status: 403,
				message: 'An active access token must be used to query information about the current user.',
			};
			const action = addUserProfileLinksError( profileLinks, error );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_ADD_FAILURE,
				profileLinks,
				error,
			} );
		} );
	} );

	describe( 'addUserProfileLinksMalformed()', () => {
		test( 'should return a user profile links add malformed action object', () => {
			const action = addUserProfileLinksMalformed( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_ADD_MALFORMED,
				profileLinks,
			} );
		} );
	} );

	describe( 'addUserProfileLinksSuccess()', () => {
		test( 'should return a user profile links add success action object', () => {
			const action = addUserProfileLinksSuccess( profileLinks );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_ADD_SUCCESS,
				profileLinks,
			} );
		} );
	} );

	describe( 'resetUserProfileLinkErrors()', () => {
		test( 'should return a user profile links errors reset action object', () => {
			const action = resetUserProfileLinkErrors();

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_RESET_ERRORS,
			} );
		} );
	} );
} );
