import nock from 'nock';
import {
	deleteDomainTransferRequest,
	fetchDomainTransferRequest,
	updateDomainTransferRequest,
} from '..';

const BASE = 'https://public-api.wordpress.com';

// The transfer request lives on the site the domain is attached to. Addressing that site by
// slug can resolve to a different blog (a self-hosted Jetpack site whose URL is the same
// domain), so these requests must address the site by its numeric ID.
describe( 'domain transfer request (any user)', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the transfer request by site ID', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/sites/123456/domains/example.net/transfer-to-any-user' )
			.reply( 200, { email: 'recipient@example.com', requested_at: '2026-10-05T08:00:00Z' } );

		await expect( fetchDomainTransferRequest( 'example.net', 123456 ) ).resolves.toEqual( {
			email: 'recipient@example.com',
			requested_at: '2026-10-05T08:00:00Z',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'creates the transfer request by site ID', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123456/domains/example.net/transfer-to-any-user', {
				email: 'recipient@example.com',
			} )
			.reply( 200, { success: true } );

		await updateDomainTransferRequest( 'example.net', 123456, 'recipient@example.com' );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'deletes the transfer request by site ID', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123456/domains/example.net/transfer-to-any-user/delete' )
			.reply( 200, { success: true } );

		await deleteDomainTransferRequest( 'example.net', 123456 );
		expect( scope.isDone() ).toBe( true );
	} );
} );
