require( 'lib/react-test-env-setup' )();

const assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	constants = require( 'lib/invites/constants' );

describe( 'List Invites Store', function() {
	let InvitesCreateValidationStore;
	const siteId = 123;
	const actions = {
		receiveValidaton: {
			type: constants.action.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS,
			siteId: siteId,
			data: {
				errors: [ 'asdfasdf' ],
				success: [
					'test_user',
					'test_email@example.com'
				]
			}
		},

	};

	beforeEach( () => {
		InvitesCreateValidationStore = require( 'lib/invites/stores/invites-create-validation' );
	} );

	describe( 'Listing invites', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.receiveValidaton );
		} );

		it( 'Validation isn\t empty', () => {
			const success = InvitesCreateValidationStore.getSuccess( siteId );
			assert.lengthOf( success, 2 );
			const errors = InvitesCreateValidationStore.getErrors( siteId );
			assert.lengthOf( errors, 1 );
		} );
	} );
} );
