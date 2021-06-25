/**
 * Internal dependencies
 */
import { addValidationSchemas, requestValidationSchemas } from '../actions';
import {
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST,
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD,
} from 'calypso/state/action-types';

describe( 'Domain Validation Schemas Actions', () => {
	test( '#requestValidationSchemas()', () => {
		expect( requestValidationSchemas( [ 'uk' ] ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST,
			tlds: [ 'uk' ],
		} );
	} );

	test( '#addValidationSchemas()', () => {
		expect( addValidationSchemas( { uk: {} } ) ).toEqual( {
			type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD,
			schemas: { uk: {} },
		} );
	} );
} );
