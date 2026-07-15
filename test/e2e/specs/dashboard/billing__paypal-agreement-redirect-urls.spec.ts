import { RestAPIClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Requests a PayPal billing agreement for the given subscription, returning
 * the parsed API response. A successful response contains the PayPal
 * approval URL the user would be redirected to; nothing is charged and the
 * agreement is inert unless approved on PayPal.
 */
async function createPayPalAgreement(
	client: RestAPIClient,
	subscriptionId: string,
	returnUrlBase: string
): Promise< unknown > {
	return await client.sendRequest(
		client.getRequestURL( '1', '/payment-methods/create-paypal-agreement' ),
		{
			method: 'post',
			headers: {
				Authorization: await client.getAuthorizationHeader( 'bearer' ),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( {
				subscription_id: subscriptionId,
				success_url: `${ returnUrlBase }/me/billing/payment-methods?success=true`,
				cancel_url: `${ returnUrlBase }/me/billing/payment-methods`,
				tax_country_code: 'US',
				tax_postal_code: '90210',
			} ),
		}
	);
}

test.describe( 'Dashboard: PayPal agreement redirect URLs', { tag: [ tags.DASHBOARD_PR ] }, () => {
	test( 'The billing API accepts dashboard-origin return URLs when creating a PayPal agreement', async ( {
		secrets,
	} ) => {
		const client = new RestAPIClient( {
			username: secrets.testAccounts.atomicUser.username,
			password: secrets.testAccounts.atomicUser.password,
		} );
		let subscriptionId: string;

		await test.step( 'Given I own an active subscription', async function () {
			const response = await client.sendRequest( client.getRequestURL( '1.2', '/upgrades' ), {
				method: 'get',
				headers: { Authorization: await client.getAuthorizationHeader( 'bearer' ) },
			} );
			expect( Array.isArray( response ), JSON.stringify( response ) ).toBe( true );
			const subscription = response.find(
				( purchase: { ID: number; expiry_status: string } ) => purchase.expiry_status !== 'expired'
			);
			expect( subscription, 'atomicUser has no active subscription' ).toBeDefined();
			subscriptionId = String( subscription.ID );
		} );

		await test.step( 'When I request a PayPal agreement returning to wordpress.com, it is accepted', async function () {
			const response = ( await createPayPalAgreement(
				client,
				subscriptionId,
				'https://wordpress.com'
			) ) as { error?: string };
			expect( response?.error, JSON.stringify( response ) ).toBeUndefined();
		} );

		await test.step( 'Then a PayPal agreement returning to my.wordpress.com is also accepted', async function () {
			const response = ( await createPayPalAgreement(
				client,
				subscriptionId,
				'https://my.wordpress.com'
			) ) as { error?: string };
			expect( response?.error, JSON.stringify( response ) ).toBeUndefined();
		} );
	} );
} );
