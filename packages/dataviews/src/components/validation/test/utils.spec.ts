import {
	createGetValidationErrors,
	getAllValidationErrors,
	normalizeIsValid,
} from '../utils';

type FormData = {
	name: string | undefined | null;
};

const isValid = < Item extends FormData >( value: Item ) =>
	value.name && value.name.length > 2 ? true : false;

const getValue = ( args: { item: FormData } ) => args.item.name;

describe( 'normalizeIsValid', () => {
	describe( 'when the rules are a function', () => {
		it( 'should return false if the value is less than 2 characters', () => {
			const normalizedIsValid = normalizeIsValid( isValid, getValue );
			expect( normalizedIsValid( { name: 'Jo' } ) ).toBe( false );
		} );

		it( 'should return true if the value is greater than 2 characters', () => {
			const normalizedIsValid = normalizeIsValid( isValid, getValue );
			expect( normalizedIsValid( { name: 'John' } ) ).toBe( true );
		} );
	} );

	describe( 'when the rules are an object', () => {
		describe( 'when the rule is isRequired', () => {
			it( 'should return false if the value is undefined', () => {
				const normalizedIsValid = normalizeIsValid(
					{ isRequired: true },
					getValue
				);
				expect( normalizedIsValid( { name: undefined } ) ).toBe(
					false
				);
			} );

			it( 'should return false if the value is empty', () => {
				const normalizedIsValid = normalizeIsValid(
					{ isRequired: true },
					getValue
				);
				expect( normalizedIsValid( { name: '' } ) ).toBe( false );
			} );

			it( 'should return false if the value is null', () => {
				const normalizedIsValid = normalizeIsValid(
					{ isRequired: true },
					getValue
				);
				expect( normalizedIsValid( { name: null } ) ).toBe( false );
			} );
			it( 'should return true if the value is defined', () => {
				const normalizedIsValid = normalizeIsValid(
					{ isRequired: true },
					getValue
				);
				expect( normalizedIsValid( { name: 'John' } ) ).toBe( true );
			} );
		} );
	} );
} );

describe( 'createGetValidationErrors', () => {
	it( 'should return an empty array if the value is valid', () => {
		const getValidationErrors = createGetValidationErrors(
			{ isValid: { isRequired: true }, id: 'name' },
			getValue
		);
		expect( getValidationErrors( { name: 'John' } ) ).toEqual( [] );
	} );

	it( 'should return an array of errors if the value is invalid', () => {
		const getValidationErrors = createGetValidationErrors(
			{ isValid: { isRequired: true }, id: 'name' },
			getValue
		);
		expect( getValidationErrors( { name: undefined } ) ).toEqual( [
			'name is required',
		] );
	} );
} );

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
