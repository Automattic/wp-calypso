import { shallow } from 'enzyme';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
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
	} );
} );
