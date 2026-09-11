import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import MockDate from 'mockdate';
import nock from 'nock';
import { ensureSiteExpiryNoticeData } from '../ensure-site-expiry-notice-data';
import type { Purchase } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 99;

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		user_id: 7,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
		site_slug: 'example.wordpress.com',
		expiry_date: expiryInDays( 3 ),
		expiry_status: 'manual-renew',
		subscription_status: 'active',
		is_plan: true,
		is_jetpack_plan_or_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		is_auto_renew_enabled: false,
		is_rechargeable: true,
		might_still_auto_renew: false,
		is_past_first_auto_renew_attempt_date: false,
		is_past_last_auto_renew_attempt_date: false,
		...overrides,
	} as Purchase;
}

const api = () => nock( 'https://public-api.wordpress.com' );

beforeEach( () => {
	MockDate.set( NOW );
	queryClient.clear();
} );
afterEach( () => {
	MockDate.reset();
	nock.cleanAll();
} );

test( 'before post-grace it settles purchases only', async () => {
	api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [ makePurchase() ] );
	const meta = api().get( `/wp/v2/sites/${ SITE_ID }/users/me` ).query( true ).reply( 200, {} );

	await ensureSiteExpiryNoticeData( SITE_ID );

	expect( queryClient.getQueryData( [ 'upgrades', 'site', SITE_ID ] ) ).toHaveLength( 1 );
	expect( meta.isDone() ).toBe( false );
} );

test( 'in post-grace it also settles the meta and the transfer status, tolerating a 404', async () => {
	api()
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, [
			makePurchase( {
				expiry_date: expiryInDays( -40 ),
				expiry_status: 'expired',
				subscription_status: 'inactive',
			} ),
		] )
		.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 200, {
			id: 1,
			name: 'me',
			slug: 'me',
			meta: { wp_wpcom_plan_expiry_notice_dismiss: 0 },
		} )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 404, { code: 'no_transfer_record' } );

	await ensureSiteExpiryNoticeData( SITE_ID );

	expect( queryClient.getQueryData( [ 'site', SITE_ID, 'users', 'current' ] ) ).toBeDefined();
	expect(
		queryClient.getQueryState( [ 'site', SITE_ID, 'atomic', 'transfers', 'latest' ] )?.status
	).toBe( 'error' );
} );

test( 'never rejects when purchases fail', async () => {
	api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 500, {} );
	await expect( ensureSiteExpiryNoticeData( SITE_ID ) ).resolves.toBeUndefined();
} );
