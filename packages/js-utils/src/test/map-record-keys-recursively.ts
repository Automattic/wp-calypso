import camelToSnakeCase from '../camel-to-snake-case';
import mapRecordKeysRecursively from '../map-record-keys-recursively';

describe( 'mapRecordKeysRecursively', () => {
	it( 'transforms the keys of a string/string record', () => {
		const record = {
			firstOne: 'helloThere',
			secondOne: 'thank you',
		};
		const expected = {
			first_one: 'helloThere',
			second_one: 'thank you',
		};
		expect( mapRecordKeysRecursively( record, camelToSnakeCase ) ).toEqual( expected );
	} );

	it( 'transforms the keys of a three-level record', () => {
		const record = {
			firstOne: 'helloThere',
			secondOne: 'thank you',
			thirdOne: {
				firstOne: 'helloThere',
				secondOne: {
					firstOne: 'helloThere',
				},
			},
		};
		const expected = {
			first_one: 'helloThere',
			second_one: 'thank you',
			third_one: {
				first_one: 'helloThere',
				second_one: {
					first_one: 'helloThere',
				},
			},
		};
		expect( mapRecordKeysRecursively( record, camelToSnakeCase ) ).toEqual( expected );
	} );

	it( 'does not transform objects within an array in the record', () => {
		const record = {
			firstOne: 'helloThere',
			secondOne: 'thank you',
			thirdOne: [
				{
					firstOne: 'helloThere',
				},
			],
		};
		const expected = {
			first_one: 'helloThere',
			second_one: 'thank you',
			third_one: [
				{
					firstOne: 'helloThere',
				},
			],
		};
		expect( mapRecordKeysRecursively( record, camelToSnakeCase ) ).toEqual( expected );
	} );
} );
