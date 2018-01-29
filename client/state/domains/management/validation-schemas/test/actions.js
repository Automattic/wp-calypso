/** @format */

/**
 * Internal dependencies
 */
import { addValidationSchema, requestValidationSchema } from '../actions';
import {
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
} from 'state/action-types';

describe( 'Domain Validation Schema Actions', () => {
	test( '#requestValidationSchema()', () => {
		expect( requestValidationSchema( [ 'uk' ] ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
			data: [ 'uk' ],
		} );
	} );

	test( '#addValidationSchema()', () => {
		expect( addValidationSchema( { uk: {} } ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
			data: { uk: {} },
		} );
	} );
} );
