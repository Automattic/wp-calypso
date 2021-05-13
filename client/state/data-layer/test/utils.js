/**
 * External dependencies
 */
import { kebabCase } from 'lodash';

/**
 * Internal dependencies
 */
import { bypassDataLayer, convertKeysBy, convertToCamelCase, convertToSnakeCase } from '../utils';

describe( 'Data Layer', () => {
	describe( '#local', () => {
		test( 'should wrap an action with the bypass flag', () => {
			const action = { type: 'ADD_SPLINE', id: 42 };
			const localAction = bypassDataLayer( action );

			expect( localAction ).toHaveProperty( 'meta.dataLayer.doBypass', true );
		} );

		test( 'should not destroy existing meta', () => {
			const action = {
				type: 'SHAVE_THE_WHALES',
				meta: {
					oceanName: 'ARCTIC',
					dataLayer: {
						forceRefresh: true,
					},
				},
			};
			const localAction = bypassDataLayer( action );

			expect( localAction ).toHaveProperty( 'meta.oceanName', 'ARCTIC' );
			expect( localAction ).toHaveProperty( 'meta.dataLayer.forceRefresh', true );
		} );
	} );

	test( '#convertToCamelCase', () => {
		const snakeObject = {
			primitive_value: 'string_const',
			'value_with.dot_key': null,
			'value_with[bracket_key]': null,
			array_value: [
				{
					first_first: 1,
					first_second: 2,
				},
				{
					second_first: 3,
					second_second: 4,
				},
			],
			another_array: [ 1, 2, { third_first: 1 } ],
			object_value: {
				obj_foo: {
					obj_foo: null,
				},
				obj_bar: {
					obj_bar: null,
				},
			},
		};

		expect( convertToCamelCase( snakeObject ) ).toEqual( {
			primitiveValue: 'string_const',
			valueWithDotKey: null,
			valueWithBracketKey: null,
			arrayValue: [
				{
					firstFirst: 1,
					firstSecond: 2,
				},
				{
					secondFirst: 3,
					secondSecond: 4,
				},
			],
			anotherArray: [ 1, 2, { thirdFirst: 1 } ],
			objectValue: {
				objFoo: {
					objFoo: null,
				},
				objBar: {
					objBar: null,
				},
			},
		} );
	} );

	describe( '#convertKeysBy', () => {
		const snakeObject = {
			primitive_value: 'string_const',
			array_value: [
				{
					first_first: 1,
					first_second: 2,
				},
				{
					second_first: 3,
					second_second: 4,
				},
			],
			object_value: {
				obj_foo: {
					obj_foo: null,
				},
				obj_bar: {
					obj_bar: null,
				},
			},
		};

		const camelObject = {
			primitiveValue: 'string_const',
			arrayValue: [
				{
					firstFirst: 1,
					firstSecond: 2,
				},
				{
					secondFirst: 3,
					secondSecond: 4,
				},
			],
			objectValue: {
				objFoo: {
					objFoo: null,
				},
				objBar: {
					objBar: null,
				},
			},
		};

		test( 'lodash native backwards/cross compatiblity', () => {
			expect( convertKeysBy( snakeObject, kebabCase ) ).toEqual(
				convertKeysBy( camelObject, kebabCase )
			);
		} );

		test( '#convertToCamelCase', () => {
			expect( convertToCamelCase( snakeObject ) ).toEqual( camelObject );
		} );

		test( '#convertToSnakeCase', () => {
			expect( convertToSnakeCase( camelObject ) ).toEqual( snakeObject );
		} );
	} );
} );
