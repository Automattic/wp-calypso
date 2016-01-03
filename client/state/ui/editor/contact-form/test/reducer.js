/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { CONTACT_FORM_DEFAULT, CONTACT_FORM_FIELD_TYPES } from '../constants';
import {
	EDITOR_CONTACT_FORM_LOAD_FORM,
	EDITOR_CONTACT_FORM_ADD_DEFAULT_FIELD,
	EDITOR_CONTACT_FORM_REMOVE_FIELD,
	EDITOR_CONTACT_FORM_CLEAR_FORM
} from 'state/action-types';

describe( "editor's contact form state reducer", () => {

	it( 'should return the default contact form when neither state nor action is provided', () => {
		const state = reducer( undefined, {} );

		assert.deepEqual( state, CONTACT_FORM_DEFAULT );
		assert.notStrictEqual( state, CONTACT_FORM_DEFAULT, 'returned state is strictly equal to CONTACT_FORM_DEFAULT.' );
	} );

	describe( 'load form', () => {
		it( 'should override the state with the provided contact form', () => {
			const contactForm = {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			};

			const state = reducer( null, {
				type: EDITOR_CONTACT_FORM_LOAD_FORM,
				contactForm
			} );

			assert.deepEqual( state, contactForm );
			assert.notStrictEqual( state, contactForm, 'the returned state and contactForm are strictly equal.' );
			assert.notStrictEqual( state.fields, contactForm.fields, 'fields on the returned state and contactForm are strictly equal.' );
		} );
	} );

	describe( 'add default field', () => {
		it( "should add the default new field to the provided state", () => {
			const contactForm = { fields: [
				{ label: 'Name' },
				{ label: 'Email' },
				{ label: 'Website' },
				{ label: 'Comment' }
			] };

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_ADD_DEFAULT_FIELD
			} );

			assert.deepEqual( state, { fields: [
				{ label: 'Name' },
				{ label: 'Email' },
				{ label: 'Website' },
				{ label: 'Comment' },
				{ label: 'Text', type: 'text' }
			] } );
			assert.deepEqual( contactForm, { fields: [
				{ label: 'Name' },
				{ label: 'Email' },
				{ label: 'Website' },
				{ label: 'Comment' }
			] } );
			assert.notStrictEqual( state, contactForm, 'the returned state and the provided state are strictly equal.' );
			assert.notStrictEqual( state.fields, contactForm.fields, 'the fields on the returned state and the provided state are strictly equal.' );
		} );

		it( 'should add the default new field to the inital state when no state is provided', () => {
			const state = reducer( undefined, { type: EDITOR_CONTACT_FORM_ADD_DEFAULT_FIELD } );

			assert.deepEqual( state, { fields: [
				{ label: 'Name', type: 'name', required: true },
				{ label: 'Email', type: 'email', required: true },
				{ label: 'Website', type: 'url' },
				{ label: 'Comment', type: 'textarea', required: true },
				{ label: 'Text', type: 'text' }
			] } );
			assert.deepEqual( CONTACT_FORM_DEFAULT, { fields: [
				{ label: 'Name', type: 'name', required: true },
				{ label: 'Email', type: 'email', required: true },
				{ label: 'Website', type: 'url' },
				{ label: 'Comment', type: 'textarea', required: true }
			] } );
		} );
	} );

	describe( 'remove field', () => {
		it( "should remove a field from the provided state by index", () => {
			const contactForm = {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			};

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_REMOVE_FIELD,
				index: 2
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Comment' }
				]
			} );
			assert.deepEqual( contactForm, {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			}, 'provided state were mutated.' );
		} );

		it( "should not mutate the inital state when no state is provided", () => {
			const state = reducer( undefined, {
				type: EDITOR_CONTACT_FORM_REMOVE_FIELD,
				index: 2
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name', type: 'name', required: true },
					{ label: 'Email', type: 'email', required: true },
					{ label: 'Comment', type: 'textarea', required: true }
				]
			} );
			assert.deepEqual( CONTACT_FORM_DEFAULT, {
				fields: [
					{ label: 'Name', type: CONTACT_FORM_FIELD_TYPES.name, required: true },
					{ label: 'Email', type: CONTACT_FORM_FIELD_TYPES.email, required: true },
					{ label: 'Website', type: CONTACT_FORM_FIELD_TYPES.url },
					{ label: 'Comment', type: CONTACT_FORM_FIELD_TYPES.textarea, required: true }
				]
			}, 'contact form default values were mutated.' );
		} );

	} );

	describe( 'reset global state', () => {
		it( "should add the default new field to the state's fields list", () => {
			const state = reducer( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' }
				]
			}, {
				type: EDITOR_CONTACT_FORM_CLEAR_FORM
			} );

			assert.deepEqual( state, CONTACT_FORM_DEFAULT );
			assert.notStrictEqual( state, CONTACT_FORM_DEFAULT, 'the returned state and the default contact form are strictly equal.' );
			assert.notStrictEqual( state.fields, CONTACT_FORM_DEFAULT.fields, 'the fields on the returned state and the default contact form are strictly equal.' );
		} );
	} );
} );
