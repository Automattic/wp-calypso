/** @format */

/**
 * Internal dependencies
 */
import { createSiteWithCart } from '../step-actions';
import { useNock } from 'test/helpers/use-nock';

jest.mock( 'lib/analytics', () => ( {
	tracks: { recordEvent() {} },
} ) );

// This is necessary since localforage will throw "no local storage method found" promise rejection without this.
// See how lib/user-settings/test apply the same trick.
jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

describe( 'createSiteWithCart()', () => {
	// createSiteWithCart() function is not designed to be easy for test at the moment.
	// Thus we intentionally mock the failing case here so that the parts we want to test
	// would be easier to write.
	useNock( nock => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( '/rest/v1.1/sites/new' )
			.reply( 400, function( uri, requestBody ) {
				return {
					error: 'error',
					message: 'something goes wrong!',
					requestBody,
				};
			} );
	} );

	test( 'should use the vertical field in the survey tree if the site topic one is empty.', () => {
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
			response => {
				expect( response.requestBody.options.site_vertical ).toEqual( vertical );
				expect( response.requestBody.options.site_vertical_id ).toBeUndefined();
			},
			[],
			[],
			fakeStore
		);
	} );

	test( 'should use the site topic state if it is not empty.', () => {
		const verticalId = 'meh';
		const siteTopicSlug = 'foo topic';
		const fakeStore = {
			getState: () => ( {
				signup: {
					steps: {
						siteType: 'blog',
						siteVertical: {
							id: verticalId,
							slug: siteTopicSlug,
						},
						survey: {
							vertical: 'should not use this',
						},
					},
				},
			} ),
		};

		createSiteWithCart(
			response => {
				expect( response.requestBody.options.site_vertical_id ).toEqual( verticalId );
				expect( response.requestBody.options.site_vertical ).toEqual( siteTopicSlug );
				expect( response.requestBody.options.site_segment ).toEqual( 'blog' );
			},
			[],
			[],
			fakeStore
		);
	} );
} );
