/**
 * Internal dependencies
 */
import {
	addUserProfileLinks,
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	deleteUserProfileLink,
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
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
	USER_PROFILE_LINKS_DELETE,
	USER_PROFILE_LINKS_DELETE_FAILURE,
	USER_PROFILE_LINKS_DELETE_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_REQUEST,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'calypso/state/action-types';

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
	const error = {
		status: 403,
		message: 'An active access token must be used to query information about the current user.',
	};

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

	describe( 'deleteUserProfileLink()', () => {
		test( 'should return a user profile links delete action object', () => {
			const linkSlug = 'https-wordpress-com';
			const action = deleteUserProfileLink( linkSlug );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_DELETE,
				linkSlug,
			} );
		} );
	} );

	describe( 'deleteUserProfileLinkSuccess()', () => {
		test( 'should return a user profile links delete success action object', () => {
			const linkSlug = 'https-wordpress-com';
			const action = deleteUserProfileLinkSuccess( linkSlug );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_DELETE_SUCCESS,
				linkSlug,
			} );
		} );
	} );

	describe( 'deleteUserProfileLinkError()', () => {
		test( 'should return a user profile links delete error action object', () => {
			const linkSlug = 'https-wordpress-com';
			const action = deleteUserProfileLinkError( linkSlug, error );

			expect( action ).toEqual( {
				type: USER_PROFILE_LINKS_DELETE_FAILURE,
				linkSlug,
				error,
			} );
		} );
	} );
} );
