import nock from 'nock';
import { fetchNamePulseAvailability, fetchNamePulseSuggestions, fetchNamePulseTlds } from '..';

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
					query.providers === 'verisign,domainsbot'
			)
			.reply( 200, {
				suggestions: [
					{ domain_name: 'coffeegoodies.com', relevance: 0.5 },
					{ domain_name: 'coffeeshop.blog', relevance: 0.9 },
				],
				errors: [ { provider: 'verisign', code: 'x', message: 'y' } ],
			} );

		const response = await fetchNamePulseSuggestions( { query: 'coffee shop' } );

		expect( scope.isDone() ).toBe( true );
		expect( response.suggestions ).toHaveLength( 2 );
		expect( response.errors ).toHaveLength( 1 );
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
} );

describe( 'fetchNamePulseTlds', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns the TLD list in the order the endpoint sends it', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/name-pulse/tlds' )
			.reply( 200, { tlds: [ 'blog', 'com', 'org' ] } );

		const tlds = await fetchNamePulseTlds();

		expect( scope.isDone() ).toBe( true );
		expect( tlds ).toEqual( [ 'blog', 'com', 'org' ] );
	} );
} );
