import nock from 'nock';
import { updateCreditCard } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'updateCreditCard', () => {
	afterEach( () => nock.cleanAll() );

	const interceptUpdate = () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.2/upgrades/123/update-credit-card', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { success: true, upgrade: {} } );
		return () => body;
	};

	test( 'sends a positive business use declaration', async () => {
		const getBody = interceptUpdate();

		await updateCreditCard( { purchaseId: 123, taxIsForBusiness: true } );

		expect( getBody() ).toMatchObject( { tax_is_for_business: true } );
	} );

	test( 'sends a negative business use declaration', async () => {
		const getBody = interceptUpdate();

		await updateCreditCard( { purchaseId: 123, taxIsForBusiness: false } );

		expect( getBody() ).toMatchObject( { tax_is_for_business: false } );
	} );

	test( 'sends an empty declaration when the buyer was never asked', async () => {
		const getBody = interceptUpdate();

		await updateCreditCard( { purchaseId: 123 } );

		expect( getBody() ).toMatchObject( { tax_is_for_business: '' } );
	} );
} );
