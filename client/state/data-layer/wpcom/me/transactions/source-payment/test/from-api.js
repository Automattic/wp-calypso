/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi from '../from-api';

describe( 'wpcom-api', () => {
	describe( 'fromApi()', () => {
		test( 'should validate and return the data successfully.', () => {
			const response = {
				status: 'profit!',
			};

			expect( fromApi( response ) ).toEqual( response );
		} );

		test( 'should invalidate when the required field is missing.', () => {
			const invalidateCall = () => {
				const invalidResponse = {
					noStatus: 'I have no status!',
				};

				fromApi( invalidResponse );
			};

			expect( invalidateCall ).toThrowError( SchemaError );
		} );
	} );
} );
