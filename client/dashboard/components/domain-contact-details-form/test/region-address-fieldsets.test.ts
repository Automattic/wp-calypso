import { RegionAddressFieldsets } from '../region-address-fieldsets';
import type { AsyncValidator } from '../contact-validation-utils';
import type { DomainContactDetails } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const asyncValidator: AsyncValidator = () => Promise.resolve( { success: true } );

const fieldById = ( fields: Field< DomainContactDetails >[], id: string ) =>
	fields.find( ( field ) => field.id === id );

const getFields = () => RegionAddressFieldsets( undefined, 'US', asyncValidator );

describe( 'RegionAddressFieldsets', () => {
	test( 'requires address line 1 with a two-character minimum', () => {
		const address1 = fieldById( getFields(), 'address1' );

		expect( address1?.isValid?.required ).toBe( true );
		expect( address1?.isValid?.minLength ).toBe( 2 );
	} );

	test( 'enforces a two-character minimum on the optional address line 2', () => {
		const address2 = fieldById( getFields(), 'address2' );

		expect( address2?.isValid?.required ).toBeUndefined();
		expect( address2?.isValid?.minLength ).toBe( 2 );
	} );
} );
