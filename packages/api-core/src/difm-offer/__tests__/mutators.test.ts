import nock from 'nock';
import { sendDifmOfferBuildRequest } from '../mutators';

describe( 'sendDifmOfferBuildRequest', () => {
	afterEach( () => nock.cleanAll() );

	test( 'posts the build request to wpcom/v2 and returns the response', async () => {
		const body = {
			description: 'A bakery site with an online menu.',
			name: 'Ada',
			source: 'site-overview' as const,
			variation: 'expert_help' as const,
		};
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/difm-offer/build-request', body )
			.query( true )
			.reply( 200, { success: true } );

		const response = await sendDifmOfferBuildRequest( 123, body );

		expect( scope.isDone() ).toBe( true );
		expect( response ).toEqual( { success: true } );
	} );
} );
