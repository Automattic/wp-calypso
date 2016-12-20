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
import { ResetPasswordFormComponent } from '..';

describe( 'ResetPasswordForm', () => {
	const inputSelectors = [
		'.reset-password-form__primary-email-option',
		'.reset-password-form__secondary-email-option',
		'.reset-password-form__sms-option',
	];

	it( 'should render as expected', () => {
		const wrapper = shallow(
			<ResetPasswordFormComponent
				primaryEmail="test@gmail.com"
				secondaryEmail="test@yahoo.com"
				phoneNumber="+15555555555" />
		);

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;

		// Expect the radio buttons to be enabled
		inputSelectors.forEach( selector => {
			expect( wrapper.find( selector ).prop( 'disabled' ) ).to.not.be.ok;
		} );

		expect( wrapper.find( '.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	context( 'fields', () => {
		useFakeDom();

		it( 'should be disabled while submitting', function() {
			const wrapper = mount(
				<ResetPasswordFormComponent
					primaryEmail="test@gmail.com"
					secondaryEmail="test@yahoo.com"
					phoneNumber="+15555555555" />
			);
			wrapper.find( '.reset-password-form__primary-email-option' ).simulate( 'change' );

			// Expect the button to be enabled
			expect( wrapper.find( '.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.not.be.ok;

			wrapper.find( '.reset-password-form__submit-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;

			// Expect the fields to be disabled
			inputSelectors.forEach( selector => {
				expect( wrapper.find( selector ).prop( 'disabled' ) ).to.be.ok;
			} );
		} );
	} );

	context( 'submit button', () => {
		useFakeDom();

		it( 'should be disabled if no reset option is selected', function() {
			const wrapper = mount(
				<ResetPasswordFormComponent
					primaryEmail="test@gmail.com"
					secondaryEmail="test@yahoo.com"
					phoneNumber="+15555555555" />
			);

			// Expect the button to be disabled
			expect( wrapper.find( '.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled when clicked', function() {
			const wrapper = mount(
				<ResetPasswordFormComponent
					primaryEmail="test@gmail.com"
					secondaryEmail="test@yahoo.com"
					phoneNumber="+15555555555" />
			);

			wrapper.find( '.reset-password-form__primary-email-option' ).simulate( 'click' );
			wrapper.find( '.reset-password-form__submit-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect( wrapper.find( '.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );
	} );
} );
