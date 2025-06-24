import deepFreeze from 'deep-freeze';
import { fromApi } from 'calypso/state/data-layer/wpcom/read/tags/utils';

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
	],
} );

const normalizedFollowedTagsResponse = deepFreeze( [
	{
		id: '307',
		slug: 'chickens',
		title: 'Chickens',
		displayName: 'Chickens',
		url: '/tag/chickens',
	},
	{
		id: '148',
		slug: 'design',
		title: 'Design',
		displayName: 'Design',
		url: '/tag/design',
	},
] );

const successfulSingleTagResponse = deepFreeze( {
	tag: {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
	},
} );

const normalizedSuccessfulSingleTagResponse = deepFreeze( [
	{
		id: '307',
		slug: 'chickens',
		title: 'Chickens',
		displayName: 'Chickens',
		url: '/tag/chickens',
	},
] );

const wordPressTagResponse = deepFreeze( {
	tag: {
		ID: '33',
		slug: 'wordpress',
		title: 'WordPress',
		display_name: 'wordpress',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/wordpress/posts',
	},
} );

const normalizedWordPressTagResponse = deepFreeze( [
	{
		id: '33',
		slug: 'wordpress',
		title: 'WordPress',
		displayName: 'WordPress',
		url: '/tag/wordpress',
	},
] );

describe( 'wpcom-api: read/tags utils', () => {
	describe( '#fromApi', () => {
		test( 'should properly normalize many tags', () => {
			const transformedResponse = fromApi( successfulFollowedTagsResponse );
			expect( transformedResponse ).toEqual( normalizedFollowedTagsResponse );
		} );

		test( 'should properly normalize a single tag', () => {
			const transformedResponse = fromApi( successfulSingleTagResponse );
			expect( transformedResponse ).toEqual( normalizedSuccessfulSingleTagResponse );
		} );

		test( 'should properly handle WordPress tag capitalization', () => {
			const transformedResponse = fromApi( wordPressTagResponse );
			expect( transformedResponse ).toEqual( normalizedWordPressTagResponse );
		} );

		test( 'should blow up when given wrong keys', () => {
			const badResponse = { noCorrectKeys: 'evil test' };
			expect( () => fromApi( badResponse ) ).toThrow();
		} );

		test( 'should blow up when given bad values', () => {
			const badResponse = fromApi( { tag: 'evil test' } );
			expect( () => fromApi( badResponse ) ).toThrow();
		} );
	} );
} );
