/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { ResetPasswordFormComponent } from '..';
import ResetOptionSet from '../reset-option-set';

describe( 'ResetPasswordForm', () => {
	const exampleResetOptions = [
		{
			email: 'test@example.com',
			sms: '+15555555555',
			name: 'primary',
		},
		{
			email: 'test2@example.com',
			sms: '+16666666666',
			name: 'secondary',
		},
	];

	const inputSelectors = [
		'.reset-password-form__email-option.primary',
		'.reset-password-form__email-option.secondary',
		'.reset-password-form__sms-option.primary',
		'.reset-password-form__sms-option.secondary',
	];

	test( 'should render as expected', () => {
		const wrapper = shallow(
			<ResetPasswordFormComponent resetOptions={ exampleResetOptions } translate={ identity } />
		);

		expect( wrapper.find( ResetOptionSet ) ).to.have.length( 2 );
		expect( wrapper.find( '.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	describe( 'fields', () => {
		test( 'should be disabled while isRequesting is true.', () => {
			const wrapper = mount(
				<ResetPasswordFormComponent
					resetOptions={ exampleResetOptions }
					isRequesting={ true }
					translate={ identity }
				/>
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
		test( 'should be disabled if no reset option is selected', () => {
			const wrapper = mount(
				<ResetPasswordFormComponent resetOptions={ exampleResetOptions } translate={ identity } />
			);

			// Expect the button to be disabled
			expect(
				wrapper
					.find( '.reset-password-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );

		test( 'should be enabled if a reset option is selected', () => {
			const wrapper = mount(
				<ResetPasswordFormComponent resetOptions={ exampleResetOptions } translate={ identity } />
			);
			wrapper.setState( { selectedMethod: 'primary_email' } );

			expect(
				wrapper
					.find( '.reset-password-form__submit-button' )
					.first()
					.prop( 'disabled' )
			).to.not.be.ok;
		} );

		test( 'should be disabled when isRequesting is true.', () => {
			const wrapper = mount(
				<ResetPasswordFormComponent
					resetOptions={ exampleResetOptions }
					isRequesting={ true }
					translate={ identity }
				/>
			);

			expect( wrapper.find( 'button.reset-password-form__submit-button' ).prop( 'disabled' ) ).to.be
				.ok;
		} );
	} );
} );
