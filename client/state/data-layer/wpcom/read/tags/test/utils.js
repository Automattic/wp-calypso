/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';

const successfulFollowedTagsResponse = deepFreeze( {
	tags: [
		{
			ID: '307',
			slug: 'chickens',
			title: 'Chickens',
			display_name: 'chickens',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
		},
		{
			ID: '148',
			slug: 'design',
			title: 'Design',
			display_name: 'design',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/design/posts',
		},
	]
} );

const normalizedFollowedTagsResponse = deepFreeze( [
	{
		id: '307',
		slug: 'chickens',
		title: 'Chickens',
		displayName: 'chickens',
		url: '/tag/chickens',
	},
	{
		id: '148',
		slug: 'design',
		title: 'Design',
		displayName: 'design',
		url: '/tag/design',
	},
] );

const successfulSingleTagResponse = deepFreeze( {
	tag: {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts'
	},
} );

const normalizedSuccessfulSingleTagResponse = deepFreeze( [
	{
		id: '307',
		slug: 'chickens',
		title: 'Chickens',
		displayName: 'chickens',
		url: '/tag/chickens',
	},
] );

describe( 'wpcom-api: read/tags utils', () => {
	describe( '#fromApi', () => {
		it( 'should properly normalize many tags', () => {
			const transformedResponse = fromApi( successfulFollowedTagsResponse );
			expect( transformedResponse ).to.eql( normalizedFollowedTagsResponse );
		} );

		it( 'should properly normalize a single tag', () => {
			const transformedResponse = fromApi( successfulSingleTagResponse );
			expect( transformedResponse ).to.eql( normalizedSuccessfulSingleTagResponse );
		} );

		it( 'should not blow up when given wrong keys', () => {
			const transformedResponse = fromApi( { noCorrectKeys: 'evil test' } );
			expect( transformedResponse ).to.eql( [] );
		} );

		it( 'should not blow up when given bad values', () => {
			const transformedResponse = fromApi( { tag: 'evil test' } );
			expect( transformedResponse ).to.eql( [] );
		} );
	} );
} );
