/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { ForgotUsernameFormComponent } from '..';

describe( 'ForgotUsername', () => {
	const inputSelectors = [
		'.forgot-username-form__first-name-input',
		'.forgot-username-form__last-name-input',
		'.forgot-username-form__site-url-input',
	];

	test( 'should render as expected', () => {
		const wrapper = shallow( <ForgotUsernameFormComponent /> );

		// Expect the fields to be enabled
		inputSelectors.forEach( selector => {
			expect( wrapper.find( selector ).prop( 'disabled' ) ).to.not.be.ok;
		} );

		expect( wrapper.find( '.forgot-username-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	describe( 'fields', () => {
		test( 'should be disabled when isRequesting is on', () => {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test" isRequesting={ true } />
			);

			// Expect the fields to be disabled
			inputSelectors.forEach( selector => {
				expect(
					wrapper
						.find( selector )
						.first()
						.prop( 'disabled' )
				).to.be.ok;
			} );
		} );
	} );

	describe( 'submit button', () => {
		test( 'should be disabled if firstName is blank', () => {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );
			wrapper.setState( {
				firstName: '',
				lastName: 'Bar',
				url: 'test.example.com',
			} );

			// Expect the button to be disabled
			expect(
				wrapper
					.find( '.forgot-username-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );

		test( 'should be disabled if lastName is blank', () => {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );
			wrapper.setState( {
				firstName: 'Foo',
				lastName: '',
				url: 'test.example.com',
			} );

			// Expect the button to be disabled
			expect(
				wrapper
					.find( '.forgot-username-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );

		test( 'should be disabled if url is blank', () => {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );
			wrapper.setState( {
				firstName: 'Foo',
				lastName: 'Bar',
				url: '',
			} );

			// Expect the button to be disabled
			expect(
				wrapper
					.find( '.forgot-username-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );

		test( 'should be enabled when all fields are filled in', () => {
			const wrapper = mount( <ForgotUsernameFormComponent className="test__test" /> );
			wrapper.setState( {
				firstName: 'Foo',
				lastName: 'Bar',
				url: 'test.example.com',
			} );

			// Expect the button to be enabled
			expect(
				wrapper
					.find( '.forgot-username-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.not.be.ok;
		} );

		test( 'should be disabled when submitted', () => {
			const wrapper = mount(
				<ForgotUsernameFormComponent className="test__test" isRequesting={ true } />
			);
			wrapper.setState( {
				firstName: 'Foo',
				lastName: 'Bar',
				url: 'test.example.com',
			} );

			inputSelectors.forEach( selector => {
				expect(
					wrapper
						.find( selector )
						.first()
						.prop( 'disabled' )
				).to.be.ok;
			} );

			expect(
				wrapper
					.find( '.forgot-username-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );
	} );
} );
