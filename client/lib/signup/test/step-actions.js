/** @format */

/**
 * Internal dependencies
 */
import { createSiteWithCart } from '../step-actions';
import { useNock } from 'test/helpers/use-nock';

describe( 'createSiteWithCart()', () => {
	// createSiteWithCart() function is not designed to be easy for test at the moment.
	// Thus we intentionally mock the failing case here so that the parts we want to test
	// would be easier to write.
	let requestBody;
	useNock( nock => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/new' )
			.reply( 400, function( uri, body ) {
				requestBody = body;
			} );
	} );

	test( 'should use the vertical field in the survery tree if the site topic one is empty.', done => {
		const vertical = 'foo topic';
		const fakeStore = {
			getState: () => ( {
				signup: {
					steps: {
						survey: {
							vertical,
						},
					},
				},
			} ),
		};

		createSiteWithCart(
			() => {
				expect( requestBody.options.vertical ).toEqual( vertical );
				done();
			},
			[],
			[],
			fakeStore
		);
	} );

	// test( 'should use the site topic state if it is not empty.', () => {
	// } );
} );
