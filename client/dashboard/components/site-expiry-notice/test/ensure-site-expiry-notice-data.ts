import { queryClient } from '@automattic/api-queries';
import MockDate from 'mockdate';
import nock from 'nock';
import {
	NOW,
	SITE_ID,
	expiryInDays,
	makePurchase,
	postGrace,
} from '../../plan-expiry-notice/test/fixtures';
import { ensureSiteExpiryNoticeData } from '../ensure-site-expiry-notice-data';

const api = () => nock( 'https://public-api.wordpress.com' );
const upgrades = ( purchases: unknown[] ) =>
	api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, purchases );

beforeEach( () => {
	MockDate.set( NOW );
	queryClient.clear();
} );
afterEach( () => {
	MockDate.reset();
	nock.cleanAll();
} );

test( 'before post-grace it settles purchases only', async () => {
	upgrades( [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ] );
	const meta = api().get( `/wp/v2/sites/${ SITE_ID }/users/me` ).query( true ).reply( 200, {} );

	await ensureSiteExpiryNoticeData( SITE_ID );

	expect( queryClient.getQueryData( [ 'upgrades', 'site', SITE_ID ] ) ).toHaveLength( 1 );
	expect( meta.isDone() ).toBe( false );
} );

test( 'in post-grace it also settles the meta and the transfer status, tolerating a 404', async () => {
	upgrades( [ postGrace() ] )
		.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta: {} } )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( 404, { code: 'no_transfer_record' } );

	await ensureSiteExpiryNoticeData( SITE_ID );

	expect( queryClient.getQueryData( [ 'site', SITE_ID, 'users', 'current' ] ) ).toBeDefined();
	expect(
		queryClient.getQueryState( [ 'site', SITE_ID, 'atomic', 'transfers', 'latest' ] )?.status
	).toBe( 'error' );
} );

test( 'never rejects when purchases fail, and does not retry', async () => {
	// One reply only: a retry would hang on an unmocked request rather than
	// settling, which is the point -- the loader blocks the page's first paint.
	const scope = api().get( '/rest/v1.2/upgrades' ).query( true ).reply( 500, {} );

	await expect( ensureSiteExpiryNoticeData( SITE_ID ) ).resolves.toBeUndefined();

	expect( scope.isDone() ).toBe( true );
	expect( queryClient.getQueryState( [ 'upgrades', 'site', SITE_ID ] )?.status ).toBe( 'error' );
} );
