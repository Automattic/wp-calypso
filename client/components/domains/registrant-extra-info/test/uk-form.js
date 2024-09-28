/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RegistrantExtraInfoUkForm } from '../uk-form';

const mockProps = {
	contactDetails: {},
	step: 'uk',
	translate: ( string ) => string,
	updateContactDetailsCache: () => {},
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
							registrationNumber: [ { errorCode: 'test', errorMessage: 'Test error message.' } ],
						},
					},
				},
			};

			render( <RegistrantExtraInfoUkForm { ...testProps } /> );
			expect( screen.getByText( 'Test error message.' ) );
		} );

		test( 'should render multiple registration errors', () => {
			const testProps = {
				...mockProps,
				ccTldDetails: { registrantType: 'LLP' },
				contactDetailsValidationErrors: {
					extra: {
						uk: {
							registrationNumber: [
								{ errorCode: 'test-1', errorMessage: 'Test error message 1.' },
								{ errorCode: 'test-2', errorMessage: 'Test error message 2.' },
							],
							tradingName: [ { errorCode: 'test-3', errorMessage: 'Test Error Message 3.' } ],
						},
					},
				},
			};

			render( <RegistrantExtraInfoUkForm { ...testProps } /> );
			expect( screen.getAllByRole( 'alert' ) ).toHaveLength( 3 );
		} );
	} );
} );
