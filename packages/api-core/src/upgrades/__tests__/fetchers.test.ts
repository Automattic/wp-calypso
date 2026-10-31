import nock from 'nock';
import { hasExtendedPurchase } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'hasExtendedPurchase', () => {
	afterEach( () => nock.cleanAll() );

	test( 'returns the has_extended flag', async () => {
		nock( BASE ).get( '/wpcom/v2/upgrades/123/has-extended' ).reply( 200, { has_extended: false } );

		expect( await hasExtendedPurchase( 123 ) ).toBe( false );
	} );
} );
