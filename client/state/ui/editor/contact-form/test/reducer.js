/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { CONTACT_FORM_DEFAULT, CONTACT_FORM_FIELD_TYPES } from '../constants';
import {
	EDITOR_CONTACT_FORM_CLEAR,
	EDITOR_CONTACT_FORM_LOAD,
	EDITOR_CONTACT_FORM_FIELD_ADD,
	EDITOR_CONTACT_FORM_FIELD_REMOVE,
	EDITOR_CONTACT_FORM_FIELD_UPDATE,
	EDITOR_CONTACT_FORM_SETTINGS_UPDATE
} from 'state/action-types';

describe( 'editor\'s contact form state reducer', () => {
	let reducer;

	useMockery();

	before( () => {
		reducer = require( '../reducer' );
	} );

	it( 'should return the default contact form when neither state nor action is provided', () => {
		const state = reducer( undefined, {} );

		assert.deepEqual( state, CONTACT_FORM_DEFAULT );
		assert.notStrictEqual( state, CONTACT_FORM_DEFAULT, 'returned state is strictly equal to CONTACT_FORM_DEFAULT.' );
	} );

	describe( 'load form', () => {
		it( 'should override the state with the provided contact form', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( null, {
				type: EDITOR_CONTACT_FORM_LOAD,
				contactForm
			} );

			assert.deepEqual( state, contactForm );
			assert.notStrictEqual( state, contactForm, 'the returned state and contactForm are strictly equal.' );
			assert.notStrictEqual( state.fields, contactForm.fields, 'fields on the returned state and contactForm are strictly equal.' );
		} );
	} );

	describe( 'add default field', () => {
		it( 'should add the default new field to the provided state', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_ADD
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
					{ label: 'Text', type: 'text', isExpanded: true }
				]
			} );
		} );

		it( 'should add the default new field to the inital state when no state is provided', () => {
			const state = reducer( undefined, { type: EDITOR_CONTACT_FORM_FIELD_ADD } );

			assert.deepEqual( state, { fields: [
				{ label: 'Name', type: 'name', required: true },
				{ label: 'Email', type: 'email', required: true },
				{ label: 'Website', type: 'url' },
				{ label: 'Comment', type: 'textarea', required: true },
				{ label: 'Text', type: 'text', isExpanded: true }
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
		it( 'should remove a field from the provided state by index', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
				index: 2
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Comment' }
				]
			} );
		} );

		it( 'should not mutate the inital state when no state is provided', () => {
			const state = reducer( undefined, {
				type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
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
					{ label: 'Website', type: CONTACT_FORM_FIELD_TYPES.website },
					{ label: 'Comment', type: CONTACT_FORM_FIELD_TYPES.textarea, required: true }
				]
			}, 'contact form default values were mutated.' );
		} );
	} );

	describe( 'reset global state', () => {
		it( 'should add the default new field to the state\'s fields list', () => {
			const state = reducer( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' }
				]
			}, {
				type: EDITOR_CONTACT_FORM_CLEAR
			} );

			assert.deepEqual( state, CONTACT_FORM_DEFAULT );
			assert.notStrictEqual( state, CONTACT_FORM_DEFAULT, 'the returned state and the default contact form are strictly equal.' );
			assert.notStrictEqual( state.fields, CONTACT_FORM_DEFAULT.fields, 'the fields on the returned state and the default contact form are strictly equal.' );
		} );
	} );

	describe( 'update field', () => {
		it( 'should update a field by index', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 2,
				field: { label: 'Web Address', type: 'url', required: true }
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Web Address', type: 'url', required: true },
					{ label: 'Comment' }
				]
			} );
		} );

		it( 'should update field options', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Drop Down List', type: 'radio', options: 'option one,option two' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: { options: 'Option One,Option Two,Option Three' }
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Drop Down List', type: 'radio', options: 'Option One,Option Two,Option Three' }
				]
			} );
		} );

		it( 'should remove the field options when chaning from radio', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Drop Down List', type: 'radio', options: 'option1,option2,option3' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'text' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Drop Down List', type: 'text' }
				]
			} );
		} );

		it( 'should remove the field options when chaning from drop down', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Drop Down List', type: 'select', options: 'option1,option2,option3' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'text' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Drop Down List', type: 'text' }
				]
			} );
		} );

		it( 'should add default options when changing to radio', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name', type: 'text' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'radio' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name', type: 'radio', options: 'Option One,Option Two' }
				]
			} );
		} );

		it( 'should add default options when changing to drop down', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name', type: 'text' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'select' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'Name', type: 'select', options: 'Option One,Option Two' }
				]
			} );
		} );

		it( 'should preserve options when changing between radio and drop down', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'List', type: 'select', options: 'option1,option2' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'radio' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'List', type: 'radio', options: 'option1,option2' }
				]
			} );
		} );

		it( 'should allow empty options for radio buttons', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'List', type: 'radio', options: 'option1,option2' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { options: '' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'List', type: 'radio', options: '' }
				]
			} );
		} );

		it( 'should allow empty options for drop down lists', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'List', type: 'select', options: 'option1,option2' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { options: '' } )
			} );

			assert.deepEqual( state, {
				fields: [
					{ label: 'List', type: 'select', options: '' }
				]
			} );
		} );
	} );

	describe( 'update settings', () => {
		it( 'should update the form destination address', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
				settings: { to: 'someone@example.com' }
			} );

			assert.deepEqual( state, {
				to: 'someone@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );
		} );

		it( 'should update the form subject line', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
				settings: { subject: 'to boldly go' }
			} );

			assert.deepEqual( state, {
				to: 'user@example.com',
				subject: 'to boldly go',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' }
				]
			} );
		} );
	} );
} );
