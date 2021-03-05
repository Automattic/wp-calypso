/**
 * Internal dependencies
 */
import { deleteUserProfileLink, handleDeleteError, handleDeleteSuccess } from '../';
import {
	deleteUserProfileLink as deleteUserProfileLinkAction,
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
} from 'calypso/state/profile-links/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const linkSlug = 'https-wordpress-com';
const error = {
	status: 403,
	message: 'An active access token must be used to query information about the current user.',
};

describe( 'deleteUserProfileLink()', () => {
	test( 'should return an action for POST HTTP request to the delete user profile link endpoint', () => {
		const action = deleteUserProfileLinkAction( linkSlug );
		const testAction = deleteUserProfileLink( action );

		expect( testAction ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/settings/profile-links/' + linkSlug + '/delete',
				},
				action
			)
		);
	} );
} );

describe( 'handleDeleteSuccess()', () => {
	test( 'should return a user profile links delete success action', () => {
		const action = handleDeleteSuccess( { linkSlug } );

		expect( action ).toEqual( deleteUserProfileLinkSuccess( linkSlug ) );
	} );
} );

describe( 'handleDeleteError()', () => {
	test( 'should return a user profile links add error action', () => {
		const action = handleDeleteError( { linkSlug }, error );

		expect( action ).toEqual( deleteUserProfileLinkError( linkSlug, error ) );
	} );
} );
