/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	formClear,
	formLoad,
	fieldAdd,
	fieldRemove,
	fieldUpdate,
	settingsUpdate,
} from '../actions';
import { CONTACT_FORM_DEFAULT } from '../constants';
import {
	EDITOR_CONTACT_FORM_CLEAR,
	EDITOR_CONTACT_FORM_LOAD,
	EDITOR_CONTACT_FORM_FIELD_ADD,
	EDITOR_CONTACT_FORM_FIELD_REMOVE,
	EDITOR_CONTACT_FORM_FIELD_UPDATE,
	EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
} from 'state/action-types';

describe( 'actions', () => {
	test( 'should return an action object to signal the initialization of the store', () => {
		const action = formLoad( CONTACT_FORM_DEFAULT );

		assert.deepEqual( action, {
			type: EDITOR_CONTACT_FORM_LOAD,
			contactForm: CONTACT_FORM_DEFAULT,
		} );
	} );

	test( 'should return an action object to signal the creation of a new default field', () => {
		const action = fieldAdd();

		assert.deepEqual( action, { type: EDITOR_CONTACT_FORM_FIELD_ADD } );
	} );

	test( 'should return an action object to signal the removal of a field by index', () => {
		const action = fieldRemove( 1 );

		assert.deepEqual( action, {
			type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
			index: 1,
		} );
	} );

	test( 'should return an action object to signal the removal of the contact form data', () => {
		const action = formClear();

		assert.deepEqual( action, { type: EDITOR_CONTACT_FORM_CLEAR } );
	} );

	test( 'should return an action object to signal the update of a field by index', () => {
		const action = fieldUpdate( 1, { label: 'Name', type: 'text', required: true } );

		assert.deepEqual( action, {
			type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
			index: 1,
			field: { label: 'Name', type: 'text', required: true },
		} );
	} );

	test( 'should return an action object to signal the update of the form settings', () => {
		const action = settingsUpdate( { to: 'user@example.com', subject: 'this is the subject' } );

		assert.deepEqual( action, {
			type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
			settings: {
				to: 'user@example.com',
				subject: 'this is the subject',
			},
		} );
	} );
} );
