/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RegistrantExtraInfoUkForm } from '../uk-form';

jest.mock( '@automattic/components', () => ( {
	FormLabel: ( { children } ) => (
		<div data-testid="test-label" key={ children }>
			{ children }
		</div>
	),
	FormInputValidation: ( { text } ) => <div data-testid="test-validation">{ text }</div>,
} ) );

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
							registrationNumber: [ { errorMessage: 'Test error message.' } ],
						},
					},
				},
			};

			render( <RegistrantExtraInfoUkForm { ...testProps } /> );
			expect( screen.getByTestId( 'test-validation' ) ).toHaveTextContent( 'Test error message.' );
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

			render( <RegistrantExtraInfoUkForm { ...testProps } /> );
			expect( screen.getAllByTestId( 'test-validation' ) ).toHaveLength( 3 );
		} );
	} );
} );
