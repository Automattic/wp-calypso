/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import { action as ActionTypes } from 'calypso/lib/invites/constants';
import InvitesCreateValidationStore from 'calypso/lib/invites/stores/invites-create-validation';

describe( 'Invites Create Validation Store', () => {
	const siteId = 123;

	const validationData = {
		errors: {
			'test@gmail.com': {
				errors: {
					'form-error-username-or-email': [ 'User already has a role on your site.' ],
				},
				error_data: [],
			},
		},
		success: [ 'testuser', 'test2@gmail.com' ],
	};

	const actions = {
		receiveValidaton: {
			type: ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS,
			siteId: siteId,
			data: validationData,
		},
	};

	describe( 'Validating invite creation', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.receiveValidaton );
		} );

		test( 'Validation is not empty', () => {
			const success = InvitesCreateValidationStore.getSuccess( siteId );
			assert.lengthOf( success, 2 );
			const errors = InvitesCreateValidationStore.getErrors( siteId );
			assert.equal( errors, validationData.errors );
		} );
	} );
} );
