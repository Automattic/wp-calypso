/**
 * Internal dependencies
 */
import { addUserProfileLinks, handleAddError, handleAddSuccess } from '../';
import {
	addUserProfileLinks as addUserProfileLinksAction,
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	receiveUserProfileLinks,
} from 'calypso/state/profile-links/actions';
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
const error = {
	status: 403,
	message: 'An active access token must be used to query information about the current user.',
};

describe( 'addUserProfileLinks()', () => {
	test( 'should return an action for POST HTTP request to the users new profile links endpoint', () => {
		const action = addUserProfileLinksAction( profileLinks );
		const testAction = addUserProfileLinks( action );

		expect( testAction ).toEqual(
			http(
				{
					apiVersion: '1.2',
					method: 'POST',
					path: '/me/settings/profile-links/new',
					body: {
						links: action.profileLinks,
					},
				},
				action
			)
		);
	} );
} );

describe( 'handleAddSuccess()', () => {
	const successAction = addUserProfileLinksSuccess( profileLinks );

	test( 'should return user profile links add success and receive actions', () => {
		const data = { profile_links: profileLinks };
		const actions = handleAddSuccess( successAction, data );

		expect( actions ).toHaveLength( 2 );
		expect( actions[ 0 ] ).toEqual( successAction );
		expect( actions[ 1 ] ).toEqual( receiveUserProfileLinks( profileLinks ) );
	} );

	test( 'should return user profile links add success and duplicate actions', () => {
		const data = {
			profile_links: [ profileLinks[ 0 ] ],
			duplicate: [ profileLinks[ 1 ] ],
		};
		const duplicateAction = addUserProfileLinksDuplicate( data.duplicate );
		const actions = handleAddSuccess( { profileLinks }, data );

		expect( actions ).toHaveLength( 2 );
		expect( actions[ 0 ] ).toEqual( successAction );
		expect( actions[ 1 ] ).toEqual( duplicateAction );
	} );

	test( 'should return user profile links add success and malformed actions', () => {
		const data = {
			profile_links: [ profileLinks[ 0 ] ],
			malformed: [ profileLinks[ 1 ] ],
		};
		const malformedAction = addUserProfileLinksMalformed( data.malformed );
		const actions = handleAddSuccess( { profileLinks }, data );

		expect( actions ).toHaveLength( 2 );
		expect( actions[ 0 ] ).toEqual( successAction );
		expect( actions[ 1 ] ).toEqual( malformedAction );
	} );
} );

describe( 'handleAddError()', () => {
	test( 'should return a user profile links add error action', () => {
		const action = handleAddError( { profileLinks }, error );

		expect( action ).toEqual( addUserProfileLinksError( profileLinks, error ) );
	} );
} );
