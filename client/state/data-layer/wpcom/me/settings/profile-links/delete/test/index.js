/** @format */

/**
 * Internal dependencies
 */
import { deleteUserProfileLink, handleDeleteError, handleDeleteSuccess } from '../';
import {
	deleteUserProfileLink as deleteUserProfileLinkAction,
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
} from 'state/profile-links/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

const error = {
	status: 403,
	message: 'An active access token must be used to query information about the current user.',
};

describe( 'deleteUserProfileLink()', () => {
	test( 'should dispatch a POST HTTP request to the delete user profile link endpoint', () => {
		const dispatch = jest.fn();
		const linkSlug = 'https-wordpress-com';
		const action = deleteUserProfileLinkAction( linkSlug );

		deleteUserProfileLink( { dispatch }, action );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
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
	test( 'should dispatch user profile links delete success action', () => {
		const dispatch = jest.fn();
		const linkSlug = 'https-wordpress-com';

		handleDeleteSuccess( { dispatch }, { linkSlug } );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( deleteUserProfileLinkSuccess( linkSlug ) );
	} );
} );

describe( 'handleDeleteError()', () => {
	test( 'should dispatch user profile links add error action', () => {
		const dispatch = jest.fn();
		const linkSlug = 'https-wordpress-com';

		handleDeleteError( { dispatch }, { linkSlug }, error );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( deleteUserProfileLinkError( linkSlug, error ) );
	} );
} );
