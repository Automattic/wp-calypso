import nock from 'nock';
import { setPaymentMethodTaxInfo } from '../fetchers';
import type { StoredPaymentMethodTaxLocation } from '../types';

const BASE = 'https://public-api.wordpress.com';

const ohio: StoredPaymentMethodTaxLocation = {
	country_code: 'US',
	postal_code: '43201',
};

describe( 'setPaymentMethodTaxInfo', () => {
	afterEach( () => nock.cleanAll() );

	const interceptTaxLocation = () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.1/me/payment-methods/12345/tax-location', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, {} );
		return () => body;
	};

	test( 'sends a positive business use declaration', async () => {
		const getBody = interceptTaxLocation();

		await setPaymentMethodTaxInfo( '12345', { ...ohio, is_for_business: true } );

		expect( getBody() ).toMatchObject( { tax_is_for_business: true } );
	} );

	test( 'sends a negative business use declaration', async () => {
		const getBody = interceptTaxLocation();

		await setPaymentMethodTaxInfo( '12345', { ...ohio, is_for_business: false } );

		expect( getBody() ).toMatchObject( { tax_is_for_business: false } );
	} );

	test( 'omits the declaration when none has been made, so the stored value is left alone', async () => {
		const getBody = interceptTaxLocation();

		await setPaymentMethodTaxInfo( '12345', ohio );

		expect( getBody() ).not.toHaveProperty( 'tax_is_for_business' );
	} );
} );
