import nock from 'nock';
import { isAtomicPrimaryDomainChangeFailed, setPrimaryDomain } from '../mutators';

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 12345;
const ATOMIC_ERROR_CODE = 'atomic_primary_domain_change_failed';
const ATOMIC_ERROR_MESSAGE =
	"We couldn't make this domain your primary domain. Please try again in a few minutes, or contact support if it keeps happening.";

describe( 'setPrimaryDomain mutator', () => {
	afterEach( () => nock.cleanAll() );

	it( 'resolves on a normal success response', async () => {
		const scope = nock( BASE )
			.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'example.com' } )
			.reply( 200, { success: true } );

		await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).resolves.toBeUndefined();
		expect( scope.isDone() ).toBe( true );
	} );

	it.each( [
		[ ATOMIC_ERROR_CODE, ATOMIC_ERROR_MESSAGE ],
		[ 'domain_not_active', 'This domain is not active.' ],
	] )( 'rejects with the server error code and message: %s', async ( error, message ) => {
		const scope = nock( BASE )
			.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'example.com' } )
			.reply( 400, { error, message } );

		await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).rejects.toMatchObject( {
			error,
			message,
		} );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'isAtomicPrimaryDomainChangeFailed', () => {
	it.each( [
		[ { error: ATOMIC_ERROR_CODE, message: 'Anything' }, true ],
		[ { error: 'domain_not_active', message: ATOMIC_ERROR_MESSAGE }, false ],
		[ new Error( ATOMIC_ERROR_MESSAGE ), false ],
		[ null, false ],
	] )( 'checks the error code of %p', ( error, expected ) => {
		expect( isAtomicPrimaryDomainChangeFailed( error ) ).toBe( expected );
	} );
} );
