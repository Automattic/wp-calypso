/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { errors, items } from '../reducer';
import {
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_DELETE_FAILURE,
	USER_PROFILE_LINKS_DELETE_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
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

	describe( 'items', () => {
		test( 'should default to null', () => {
			const state = items( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should set profile links to empty array when user has no profile links', () => {
			const state = items( undefined, {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks: [],
			} );

			expect( state ).toEqual( [] );
		} );

		test( 'should add profile links to the initial state', () => {
			const state = items( null, {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks,
			} );

			expect( state ).toEqual( profileLinks );
		} );

		test( 'should overwrite profile links in state', () => {
			const newProfileLinks = [
				{
					link_slug: 'automattic-com',
					title: 'Automattic',
					value: 'https://automattic.com/',
				},
				{
					link_slug: 'gravatar-com',
					title: 'Gravatar',
					value: 'https://gravatar.com/',
				},
			];
			const state = deepFreeze( profileLinks );
			const newState = items( state, {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks: newProfileLinks,
			} );

			expect( newState ).toEqual( newProfileLinks );
		} );

		test( 'should delete profile links by slug from state', () => {
			const state = deepFreeze( profileLinks );
			const newState = items( state, {
				type: USER_PROFILE_LINKS_DELETE_SUCCESS,
				linkSlug: profileLinks[ 0 ].link_slug,
			} );

			expect( newState ).toEqual( [ profileLinks[ 1 ] ] );
		} );
	} );

	describe( 'errors', () => {
		test( 'should default to an empty object', () => {
			const state = errors( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should reset all errors in state on success', () => {
			const state = deepFreeze( { error: 'An error has occurred' } );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_ADD_SUCCESS,
				profileLinks,
			} );

			expect( newState ).toEqual( {} );
		} );

		test( 'should store duplicate links as errors in state', () => {
			const state = deepFreeze( { error: 'An error has occurred' } );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_ADD_DUPLICATE,
				profileLinks,
			} );

			expect( newState ).toEqual( { duplicate: profileLinks } );
		} );

		test( 'should store malformed links as errors in state', () => {
			const state = deepFreeze( { error: 'An error has occurred' } );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_ADD_MALFORMED,
				profileLinks,
			} );

			expect( newState ).toEqual( { malformed: profileLinks } );
		} );

		test( 'should store request errors in state', () => {
			const error = {
				status: 403,
				message: 'An active access token must be used to query information about the current user.',
			};
			const state = deepFreeze( { malformed: profileLinks } );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_ADD_FAILURE,
				profileLinks,
				error,
			} );

			expect( newState ).toEqual( { error } );
		} );

		test( 'should reset all errors in state when specifically requested', () => {
			const state = deepFreeze( { error: 'An error has occurred' } );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_RESET_ERRORS,
			} );

			expect( newState ).toEqual( {} );
		} );

		test( 'should reset all errors in state on delete success', () => {
			const state = deepFreeze( { error: 'An error has occurred' } );
			const linkSlug = 'https-wordpress-com';
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_DELETE_SUCCESS,
				linkSlug,
			} );

			expect( newState ).toEqual( {} );
		} );

		test( 'should store delete request errors in state', () => {
			const error = {
				status: 404,
				message: 'The requested profile link was not found.',
			};
			const linkSlug = 'https-wordpress-com';
			const state = deepFreeze( {} );
			const newState = errors( state, {
				type: USER_PROFILE_LINKS_DELETE_FAILURE,
				linkSlug,
				error,
			} );

			expect( newState ).toEqual( { error } );
		} );
	} );
} );
