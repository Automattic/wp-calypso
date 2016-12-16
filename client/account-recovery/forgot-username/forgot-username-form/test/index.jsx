/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { ForgotUsernameFormComponent } from '..';

describe( 'ForgotUsername', () => {
	const inputSelectors = [
		'.forgot-username-form__first-name-input',
		'.forgot-username-form__last-name-input',
		'.forgot-username-form__site-url-input',
	];

	it( 'should render as expected', () => {
		const wrapper = shallow( <ForgotUsernameFormComponent /> );

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;

		// Expect the fields to be enabled
		inputSelectors.forEach( selector => {
			expect( wrapper.find( selector ).prop( 'disabled' ) ).to.not.be.ok;
		} );

		expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	context( 'fields', () => {
		useFakeDom();

		it( 'should be disabled while submitting', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			wrapper.find( '.forgot-username-form__submit-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;

			// Expect the fields to be disabled
			inputSelectors.forEach( selector => {
				expect( wrapper.find( selector ).prop( 'disabled' ) ).to.be.ok;
			} );
		} );
	} );

	context( 'submit button', () => {
		useFakeDom();

		it( 'should be disabled if first name field is blank', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			// Change the field to be empty
			wrapper.find( '.forgot-username-form__first-name-input' ).node.value = '';
			wrapper.find( '.forgot-username-form__first-name-input' ).simulate( 'change' );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled if last name field is blank', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			// Change the field to be empty
			wrapper.find( '.forgot-username-form__last-name-input' ).node.value = '';
			wrapper.find( '.forgot-username-form__last-name-input' ).simulate( 'change' );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled if site url field is blank', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			// Change the field to be empty
			wrapper.find( '.forgot-username-form__site-url-input' ).node.value = '';
			wrapper.find( '.forgot-username-form__site-url-input' ).simulate( 'change' );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be enabled when all fields are filled in', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			// Expect the button to be enabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.not.be.ok;
		} );

		it( 'should be disabled when clicked', function() {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );

			// Initialize all inputs with some dummy text
			inputSelectors.forEach( selector => {
				wrapper.find( selector ).node.value = 'dummy text';
				wrapper.find( selector ).simulate( 'change' );
			} );

			wrapper.find( '.forgot-username-form__submit-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );
	} );
} );
