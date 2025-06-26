import { getAllValidationErrors } from '../get-all-validation-errors';

describe( 'getAllValidationErrors', () => {
	it( 'should return an empty array if the value is valid', () => {
		const fields = [
			{ isValid: { isRequired: true }, id: 'name' },
			{ isValid: { isRequired: true }, id: 'surname' },
		];

		const form = {
			fields,
		};

		const validationErrors = getAllValidationErrors(
			{ name: 'John', surname: 'Doe' },
			fields,
			form
		);

		expect( validationErrors ).toEqual( [] );
	} );

	it( 'should return an array of errors if the value is invalid', () => {
		const fields = [
			{ isValid: { isRequired: true }, id: 'name' },
			{ isValid: { isRequired: true }, id: 'surname' },
		];

		const form = {
			fields,
		};

		const validationErrors = getAllValidationErrors(
			{ name: 'John', surname: '' },
			fields,
			form
		);

		expect( validationErrors ).toEqual( [
			{ field: 'surname', messages: [ 'surname is required' ] },
		] );
	} );
} );
