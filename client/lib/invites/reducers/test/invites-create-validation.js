/** @format */
/**
 * External dependencies
 */
const assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	constants = require( 'lib/invites/constants' );

describe( 'Invites Create Validation Store', () => {
	let InvitesCreateValidationStore;
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
			type: constants.action.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS,
			siteId: siteId,
			data: validationData,
		},
	};

	beforeEach( () => {
		InvitesCreateValidationStore = require( 'lib/invites/stores/invites-create-validation' );
	} );

	describe( 'Validating invite creation', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.receiveValidaton );
		} );

		it( 'Validation is not empty', () => {
			const success = InvitesCreateValidationStore.getSuccess( siteId );
			assert.lengthOf( success, 2 );
			const errors = InvitesCreateValidationStore.getErrors( siteId );
			assert.equal( errors, validationData.errors );
		} );
	} );
} );
