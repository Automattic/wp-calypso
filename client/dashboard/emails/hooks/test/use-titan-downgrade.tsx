/**
 * @jest-environment jsdom
 */
import { TitanMailSlugs } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { useTitanDowngrade } from '../use-titan-downgrade';
import type { Domain, Purchase } from '@automattic/api-core';

const SITE_ID = 777;
const DOMAIN_NAME = 'example.com';
const PURCHASE_ID = 29102774;
const PRO_MONTHLY_PRODUCT_ID = 400;

const domain = { blog_id: SITE_ID } as Domain;

function titanPurchase( overrides: Partial< Purchase > = {} ) {
	return {
		ID: PURCHASE_ID,
		product_slug: TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG,
		meta: DOMAIN_NAME,
		blog_id: SITE_ID,
		currency_code: 'USD',
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		is_instant_downgrade_available: false,
		is_delayed_downgrade_pending: false,
		...overrides,
	};
}

function mockSitePurchases( ...purchases: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );
}

function Harness() {
	const { downgrade, cancelDowngrade, mode, canDowngrade, isDowngradePending } = useTitanDowngrade(
		{ domain, domainName: DOMAIN_NAME }
	);

	return (
		<>
			<span>{ `mode:${ mode }` }</span>
			<span>{ `canDowngrade:${ canDowngrade }` }</span>
			<span>{ `pending:${ isDowngradePending }` }</span>
			<button onClick={ () => downgrade( PRO_MONTHLY_PRODUCT_ID ) }>downgrade</button>
			<button onClick={ () => cancelDowngrade() }>cancel</button>
		</>
	);
}

describe( 'useTitanDowngrade', () => {
	test( 'schedules the downgrade for renewal when outside the refund window', async () => {
		mockSitePurchases( titanPurchase() );
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/upgrades/${ PURCHASE_ID }/delayed-downgrade`, {
				enabled: true,
				to_product_id: PRO_MONTHLY_PRODUCT_ID,
			} )
			.reply( 200, { success: true, delayed_downgrade: { is_pending: true } } );

		render( <Harness /> );
		await screen.findByText( 'canDowngrade:true' );
		expect( screen.getByText( 'mode:delayed' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'downgrade' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'downgrades immediately when inside the refund window', async () => {
		mockSitePurchases(
			titanPurchase( { is_instant_downgrade_available: true } as Partial< Purchase > )
		);
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/upgrades/${ PURCHASE_ID }/cancel`, {
				type: 'downgrade',
				to_product_id: PRO_MONTHLY_PRODUCT_ID,
			} )
			.reply( 200, { status: 'completed', message: 'ok' } );

		render( <Harness /> );
		await screen.findByText( 'mode:instant' );

		await userEvent.click( screen.getByRole( 'button', { name: 'downgrade' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'cancels a scheduled downgrade without a target product', async () => {
		mockSitePurchases(
			titanPurchase( { is_delayed_downgrade_pending: true } as Partial< Purchase > )
		);
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/upgrades/${ PURCHASE_ID }/delayed-downgrade`, { enabled: false } )
			.reply( 200, { success: true, delayed_downgrade: { is_pending: false } } );

		render( <Harness /> );
		await screen.findByText( 'pending:true' );

		await userEvent.click( screen.getByRole( 'button', { name: 'cancel' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'offers no downgrade for an expired subscription', async () => {
		mockSitePurchases( titanPurchase( { expiry_status: 'expired' } as Partial< Purchase > ) );

		render( <Harness /> );

		expect( await screen.findByText( 'canDowngrade:false' ) ).toBeVisible();
	} );

	test( 'offers no downgrade when the domain has no Titan subscription', async () => {
		mockSitePurchases( titanPurchase( { meta: 'other-domain.com' } as Partial< Purchase > ) );

		render( <Harness /> );

		expect( await screen.findByText( 'canDowngrade:false' ) ).toBeVisible();
	} );
} );
