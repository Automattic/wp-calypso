import { queryClient } from '@automattic/api-queries';
import MockDate from 'mockdate';
import nock from 'nock';
import {
	NOW,
	SITE_ID,
	expiryInDays,
	makePurchase,
	revertedTransfer,
} from '../../plan-expiry-notice/test/fixtures';
import { ensureSiteExpiryNoticeData } from '../ensure-site-expiry-notice-data';
import { PURCHASES_STALE_TIME } from '../use-site-expiry-notice';

const api = () => nock( 'https://public-api.wordpress.com' );
const upgrades = ( purchases: unknown[] ) =>
	api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, purchases );
const site = ( is_wpcom_atomic = false ) => ( { ID: SITE_ID, is_wpcom_atomic } );

const PURCHASES_KEY = [ 'upgrades', 'site', SITE_ID ];
const CURRENT_USER_KEY = [ 'site', SITE_ID, 'users', 'current' ];
const TRANSFER_KEY = [ 'site', SITE_ID, 'expiry-notice', 'transfer' ];

beforeEach( () => {
	MockDate.set( NOW );
	queryClient.clear();
} );
afterEach( () => MockDate.reset() );

test( 'with a plan it settles purchases only', async () => {
	upgrades( [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ] );
	const transfer = api()
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, {} );

	await ensureSiteExpiryNoticeData( site() );

	expect( queryClient.getQueryData( PURCHASES_KEY ) ).toHaveLength( 1 );
	expect( transfer.isDone() ).toBe( false );
} );

test( 'refetches purchases the hook would consider stale', async () => {
	// A persisted copy from an earlier visit may predate the plan's lapse; the
	// loader must not settle the stage from it, or the notice pops in after paint.
	queryClient.setQueryData( PURCHASES_KEY, [], {
		updatedAt: Date.now() - PURCHASES_STALE_TIME - 1,
	} );
	const scope = upgrades( [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ] );

	await ensureSiteExpiryNoticeData( site() );

	expect( scope.isDone() ).toBe( true );
	expect( queryClient.getQueryData( PURCHASES_KEY ) ).toHaveLength( 1 );
} );

test( 'keeps purchases the hook would consider fresh', async () => {
	queryClient.setQueryData( PURCHASES_KEY, [], { updatedAt: Date.now() - 1000 } );
	const scope = upgrades( [] );

	await ensureSiteExpiryNoticeData( site( true ) );

	expect( scope.isDone() ).toBe( false );
} );

test( 'with no plan on an Atomic site it settles purchases only', async () => {
	upgrades( [] );
	const transfer = api()
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, {} );

	await ensureSiteExpiryNoticeData( site( true ) );

	expect( transfer.isDone() ).toBe( false );
} );

test( 'with no plan on a Simple site it settles the transfer, tolerating a 404', async () => {
	upgrades( [] )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 404, { code: 'no_transfer_record' } );
	const meta = api().get( `/wp/v2/sites/${ SITE_ID }/users/me` ).query( true ).reply( 200, {} );

	await ensureSiteExpiryNoticeData( site() );

	expect( queryClient.getQueryData( TRANSFER_KEY ) ).toBeNull();
	expect( meta.isDone() ).toBe( false );
} );

test( 'a second call within the day makes no transfer request', async () => {
	upgrades( [] )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 404, { code: 'no_transfer_record' } );

	await ensureSiteExpiryNoticeData( site() );
	expect( queryClient.getQueryData( TRANSFER_KEY ) ).toBeNull();

	// No transfer interceptor left: a second, unmatched request would throw.
	upgrades( [] );
	await expect( ensureSiteExpiryNoticeData( site() ) ).resolves.toBeUndefined();
	expect( queryClient.getQueryData( TRANSFER_KEY ) ).toBeNull();
} );

test( 'in the revert window it also settles the dismissal meta', async () => {
	upgrades( [] )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, revertedTransfer( 10 ) )
		.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta: {} } );

	await ensureSiteExpiryNoticeData( site() );

	expect( queryClient.getQueryData( CURRENT_USER_KEY ) ).toBeDefined();
} );

test( 'outside the revert window it leaves the meta alone', async () => {
	upgrades( [] )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, revertedTransfer( 30 ) );
	const meta = api().get( `/wp/v2/sites/${ SITE_ID }/users/me` ).query( true ).reply( 200, {} );

	await ensureSiteExpiryNoticeData( site() );

	expect( meta.isDone() ).toBe( false );
} );

test( 'never rejects when purchases fail, and does not retry', async () => {
	// One reply only: a retry would hang on an unmocked request rather than
	// settling, which is the point -- the loader blocks the page's first paint.
	const scope = api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 500, {} );

	await expect( ensureSiteExpiryNoticeData( site() ) ).resolves.toBeUndefined();

	expect( scope.isDone() ).toBe( true );
	expect( queryClient.getQueryState( PURCHASES_KEY )?.status ).toBe( 'error' );
} );

test( 'never rejects when the meta fetch fails, and does not retry', async () => {
	upgrades( [] )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, revertedTransfer( 10 ) );
	const meta = api().get( `/wp/v2/sites/${ SITE_ID }/users/me` ).query( true ).reply( 500, {} );

	await expect( ensureSiteExpiryNoticeData( site() ) ).resolves.toBeUndefined();

	expect( meta.isDone() ).toBe( true );
	expect( queryClient.getQueryState( CURRENT_USER_KEY )?.status ).toBe( 'error' );
} );
