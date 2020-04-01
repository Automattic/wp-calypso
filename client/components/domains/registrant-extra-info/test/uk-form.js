/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { RegistrantExtraInfoUkForm } from '../uk-form';
import FormInputValidation from 'components/forms/form-input-validation';

const mockProps = {
	contactDetails: {},
	step: 'uk',
	translate: identity,
	updateContactDetailsCache: identity,
};

describe( 'uk-form', () => {
	describe( 'Validation Errors', () => {
		test( 'should render the correct registation errors', () => {
			const testProps = {
				...mockProps,
				ccTldDetails: { registrantType: 'LLP' },
				contactDetailsValidationErrors: {
					extra: {
						uk: {
							registrationNumber: [ { errorMessage: 'Test error message.' } ],
						},
					},
				},
			};

			const wrapper = shallow( <RegistrantExtraInfoUkForm { ...testProps } /> );
			const error = wrapper.find( FormInputValidation );
			expect( error.props() ).toHaveProperty( 'text', 'Test error message.' );
		} );

		test( 'should render multiple registration errors', () => {
			const testProps = {
				...mockProps,
				ccTldDetails: { registrantType: 'LLP' },
				contactDetailsValidationErrors: {
					extra: {
						uk: {
							registrationNumber: [
								{ errorMessage: 'Test error message 1.' },
								{ errorMessage: 'Test error message 2.' },
							],
							tradingName: [ { errorMessage: 'Test Error Message 3.' } ],
						},
					},
				},
			};

			const wrapper = shallow( <RegistrantExtraInfoUkForm { ...testProps } /> );
			const error = wrapper.find( FormInputValidation );
			expect( error ).toHaveProperty( 'length', 3 );
		} );

		test( 'Should disable submit button with validation errors', () => {
			const testProps = {
				...mockProps,
				ccTldDetails: { registrantType: 'LLP' },
				contactDetailsValidationErrors: {
					extra: {
						uk: {
							registrationNumber: [ 'dotukRegistrationNumberFormat' ],
						},
					},
				},
			};

			const wrapper = shallow(
				<RegistrantExtraInfoUkForm { ...testProps }>
					<button className="test__hush-eslint .submit-button" />
				</RegistrantExtraInfoUkForm>
			);

			expect( wrapper.find( 'button' ).prop( 'disabled' ) ).toBe( true );
		} );

		test( 'Should not disable submit button with irrelevant validation errors', () => {
			const testProps = {
				...mockProps,
				ccTldDetails: { registrantType: 'IND' },
				contactDetailsValidationErrors: {
					extra: {
						uk: {
							registrationNumber: [ 'dotukRegistrationNumberFormat' ],
						},
					},
				},
			};

			const wrapper = shallow(
				<RegistrantExtraInfoUkForm { ...testProps }>
					<button className="test__hush-eslint .submit-button" />
				</RegistrantExtraInfoUkForm>
			);
			expect( wrapper.find( 'button' ).prop( 'disabled' ) ).toBe( undefined );
		} );
	} );
} );
