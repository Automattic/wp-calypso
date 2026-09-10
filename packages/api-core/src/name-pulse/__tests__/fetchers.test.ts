import nock from 'nock';
import { fetchNamePulseAvailability, fetchNamePulseSuggestions } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchNamePulseSuggestions', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests keyword suggestions with use_ai=0 and the default providers', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/name-pulse/suggestions' )
			.query(
				( query ) =>
					query.query === 'coffee shop' &&
					query.use_ai === '0' &&
					query.allow_premium === 'true' &&
					query.providers === 'verisign,domainsbot' &&
					query.timeout === undefined
			)
			.reply( 200, {
				suggestions: [
					{ domain_name: 'coffeegoodies.com', relevance: 0.5, vendor: 'verisign' },
					{ domain_name: 'coffeeshop.blog', relevance: 0.9, vendor: 'domainsbot' },
				],
				errors: [],
			} );

		const response = await fetchNamePulseSuggestions( { query: 'Coffee Shop ' } );

		expect( scope.isDone() ).toBe( true );
		expect( response.suggestions ).toHaveLength( 2 );
		expect( response.errors ).toEqual( [] );
	} );

	it( 'sends use_ai=1 and the timeout in AI mode', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/name-pulse/suggestions' )
			.query( ( query ) => query.use_ai === '1' && query.timeout === '10000' )
			.reply( 200, {
				suggestions: [],
				errors: [ { provider: 'verisign', code: 'x', message: 'y' } ],
			} );

		const response = await fetchNamePulseSuggestions( {
			query: 'a blog about specialty coffee',
			use_ai: true,
			timeout: 10000,
		} );

		expect( scope.isDone() ).toBe( true );
		expect( response.errors ).toHaveLength( 1 );
	} );

	it( 'normalises a response without suggestions to an empty list', async () => {
		nock( BASE ).get( '/wpcom/v2/domains/name-pulse/suggestions' ).query( true ).reply( 200, {} );

		const response = await fetchNamePulseSuggestions( { query: 'coffee shop' } );

		expect( response ).toEqual( { suggestions: [], errors: [] } );
	} );
} );

describe( 'fetchNamePulseAvailability', () => {
	afterEach( () => nock.cleanAll() );

	it( 'posts the domain names and returns the keyed response', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/domains/name-pulse/availability-check', {
				domain_names: [ 'coffee.blog', 'coffee.com' ],
			} )
			.reply( 200, {
				'coffee.blog': { is_available: true, cost: '$22.00', raw_price: 22 },
				'coffee.com': { is_available: false },
			} );

		const response = await fetchNamePulseAvailability( [ 'coffee.blog', 'coffee.com' ] );

		expect( scope.isDone() ).toBe( true );
		expect( response[ 'coffee.blog' ].is_available ).toBe( true );
		expect( response[ 'coffee.com' ] ).toEqual( { is_available: false } );
	} );

	it( 'returns an empty object without a request for an empty list', async () => {
		const response = await fetchNamePulseAvailability( [] );

		expect( response ).toEqual( {} );
	} );

	it( 'rejects more than 50 domains', async () => {
		const domains = Array.from( { length: 51 }, ( _, i ) => `domain${ i }.com` );

		await expect( fetchNamePulseAvailability( domains ) ).rejects.toThrow( /at most 50/ );
	} );
} );
