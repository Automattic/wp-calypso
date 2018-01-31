/** @format */

/**
 * Internal dependencies
 */
import { addValidationSchema, requestValidationSchemas } from '../actions';
import {
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
} from 'state/action-types';

describe( 'Domain Validation Schema Actions', () => {
	test( '#requestValidationSchemas()', () => {
		expect( requestValidationSchemas( [ 'uk' ] ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
			tlds: [ 'uk' ],
		} );
	} );

	test( '#addValidationSchema()', () => {
		expect( addValidationSchema( { uk: {} } ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
			schemas: { uk: {} },
		} );
	} );
} );
