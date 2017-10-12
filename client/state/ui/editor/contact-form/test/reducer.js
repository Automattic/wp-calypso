/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { CONTACT_FORM_DEFAULT, CONTACT_FORM_FIELD_TYPES } from '../constants';
import {
	EDITOR_CONTACT_FORM_CLEAR,
	EDITOR_CONTACT_FORM_LOAD,
	EDITOR_CONTACT_FORM_FIELD_ADD,
	EDITOR_CONTACT_FORM_FIELD_REMOVE,
	EDITOR_CONTACT_FORM_FIELD_UPDATE,
	EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
} from 'state/action-types';

describe( "editor's contact form state reducer", () => {
	let reducer;

	beforeAll( () => {
		reducer = require( '../reducer' );
	} );

	test( 'should return the default contact form when neither state nor action is provided', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( CONTACT_FORM_DEFAULT );
		expect( state ).not.toBe( CONTACT_FORM_DEFAULT );
	} );

	describe( 'load form', () => {
		test( 'should override the state with the provided contact form', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( null, {
				type: EDITOR_CONTACT_FORM_LOAD,
				contactForm,
			} );

			expect( state ).toEqual( contactForm );
			expect( state ).not.toBe( contactForm );
			expect( state.fields ).not.toBe( contactForm.fields );
		} );
	} );

	describe( 'add default field', () => {
		test( 'should add the default new field to the provided state', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_ADD,
			} );

			expect( state ).toEqual( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
					{ label: 'Text', type: 'text', isExpanded: true },
				],
			} );
		} );

		test( 'should add the default new field to the inital state when no state is provided', () => {
			const state = reducer( undefined, { type: EDITOR_CONTACT_FORM_FIELD_ADD } );

			expect( state ).toEqual( {
				fields: [
					{ label: 'Name', type: 'name', required: true },
					{ label: 'Email', type: 'email', required: true },
					{ label: 'Website', type: 'url' },
					{ label: 'Comment', type: 'textarea', required: true },
					{ label: 'Text', type: 'text', isExpanded: true },
				],
			} );
			expect( CONTACT_FORM_DEFAULT ).toEqual( {
				fields: [
					{ label: 'Name', type: 'name', required: true },
					{ label: 'Email', type: 'email', required: true },
					{ label: 'Website', type: 'url' },
					{ label: 'Comment', type: 'textarea', required: true },
				],
			} );
		} );
	} );

	describe( 'remove field', () => {
		test( 'should remove a field from the provided state by index', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
				index: 2,
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'Name' }, { label: 'Email' }, { label: 'Comment' } ],
			} );
		} );

		test( 'should not mutate the inital state when no state is provided', () => {
			const state = reducer( undefined, {
				type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
				index: 2,
			} );

			expect( state ).toEqual( {
				fields: [
					{ label: 'Name', type: 'name', required: true },
					{ label: 'Email', type: 'email', required: true },
					{ label: 'Comment', type: 'textarea', required: true },
				],
			} );
			expect( CONTACT_FORM_DEFAULT ).toEqual( {
				fields: [
					{ label: 'Name', type: CONTACT_FORM_FIELD_TYPES.name, required: true },
					{ label: 'Email', type: CONTACT_FORM_FIELD_TYPES.email, required: true },
					{ label: 'Website', type: CONTACT_FORM_FIELD_TYPES.website },
					{ label: 'Comment', type: CONTACT_FORM_FIELD_TYPES.textarea, required: true },
				],
			} );
		} );
	} );

	describe( 'reset global state', () => {
		test( "should add the default new field to the state's fields list", () => {
			const state = reducer(
				{
					fields: [ { label: 'Name' }, { label: 'Email' } ],
				},
				{
					type: EDITOR_CONTACT_FORM_CLEAR,
				}
			);

			expect( state ).toEqual( CONTACT_FORM_DEFAULT );
			expect( state ).not.toBe( CONTACT_FORM_DEFAULT );
			expect( state.fields ).not.toBe( CONTACT_FORM_DEFAULT.fields );
		} );
	} );

	describe( 'update field', () => {
		test( 'should update a field by index', () => {
			const contactForm = deepFreeze( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 2,
				field: { label: 'Web Address', type: 'url', required: true },
			} );

			expect( state ).toEqual( {
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Web Address', type: 'url', required: true },
					{ label: 'Comment' },
				],
			} );
		} );

		test( 'should update field options', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'Drop Down List', type: 'radio', options: 'option one,option two' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: { options: 'Option One,Option Two,Option Three' },
			} );

			expect( state ).toEqual( {
				fields: [
					{ label: 'Drop Down List', type: 'radio', options: 'Option One,Option Two,Option Three' },
				],
			} );
		} );

		test( 'should remove the field options when chaning from radio', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'Drop Down List', type: 'radio', options: 'option1,option2,option3' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'text' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'Drop Down List', type: 'text' } ],
			} );
		} );

		test( 'should remove the field options when chaning from drop down', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'Drop Down List', type: 'select', options: 'option1,option2,option3' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'text' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'Drop Down List', type: 'text' } ],
			} );
		} );

		test( 'should add default options when changing to radio', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'Name', type: 'text' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'radio' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'Name', type: 'radio', options: 'Option One,Option Two' } ],
			} );
		} );

		test( 'should add default options when changing to drop down', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'Name', type: 'text' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'select' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'Name', type: 'select', options: 'Option One,Option Two' } ],
			} );
		} );

		test( 'should preserve options when changing between radio and drop down', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'List', type: 'select', options: 'option1,option2' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { type: 'radio' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'List', type: 'radio', options: 'option1,option2' } ],
			} );
		} );

		test( 'should allow empty options for radio buttons', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'List', type: 'radio', options: 'option1,option2' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { options: '' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'List', type: 'radio', options: '' } ],
			} );
		} );

		test( 'should allow empty options for drop down lists', () => {
			const contactForm = deepFreeze( {
				fields: [ { label: 'List', type: 'select', options: 'option1,option2' } ],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
				index: 0,
				field: deepFreeze( { options: '' } ),
			} );

			expect( state ).toEqual( {
				fields: [ { label: 'List', type: 'select', options: '' } ],
			} );
		} );
	} );

	describe( 'update settings', () => {
		test( 'should update the form destination address', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
				settings: { to: 'someone@example.com' },
			} );

			expect( state ).toEqual( {
				to: 'someone@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );
		} );

		test( 'should update the form subject line', () => {
			const contactForm = deepFreeze( {
				to: 'user@example.com',
				subject: 'here be dragons',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );

			const state = reducer( contactForm, {
				type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
				settings: { subject: 'to boldly go' },
			} );

			expect( state ).toEqual( {
				to: 'user@example.com',
				subject: 'to boldly go',
				fields: [
					{ label: 'Name' },
					{ label: 'Email' },
					{ label: 'Website' },
					{ label: 'Comment' },
				],
			} );
		} );
	} );
} );
