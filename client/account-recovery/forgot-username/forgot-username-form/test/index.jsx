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

		// Expect the fields to be enabled
		inputSelectors.forEach( selector => {
			expect( wrapper.find( selector ).prop( 'disabled' ) ).to.not.be.ok;
		} );

		expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	context( 'fields', () => {
		useFakeDom();

		it( 'should be disabled when isRequesting is on', function() {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test"
					isRequesting={ true }
				/> );

			// Expect the fields to be disabled
			inputSelectors.forEach( selector => {
				expect( wrapper.find( selector ).prop( 'disabled' ) ).to.be.ok;
			} );
		} );
	} );

	context( 'submit button', () => {
		useFakeDom();

		it( 'should be disabled if firstName is blank', function() {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test"
					userData={ {
						firstName: '',
						lastName: 'Bar',
						url: 'test.example.com',
					} }
				/> );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled if lastName is blank', function() {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test"
					userData={ {
						firstName: 'Foo',
						lastName: '',
						url: 'test.example.com',
					} }
				/> );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled if url is blank', function() {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test"
					userData={ {
						firstName: 'Foo',
						lastName: 'Bar',
						url: '',
					} }
				/> );

			// Expect the button to be disabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be enabled when all fields are filled in', function() {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test"
					userData={ {
						firstName: 'Foo',
						lastName: 'Bar',
						url: 'test.example.com',
					} }
				/> );

			// Expect the button to be enabled
			expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.not.be.ok;
		} );
	} );
} );
