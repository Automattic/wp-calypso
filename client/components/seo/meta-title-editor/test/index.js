import { nativeToRaw, rawToNative, fromApi, toApi } from '../mappings';

describe( 'SEO', () => {
	describe( 'Title Format Editor', () => {
		describe( '#nativeToRaw', () => {
			test( 'should produce empty formats', () => {
				expect( nativeToRaw( [] ) ).toEqual( [] );
			} );

			test( 'should produce plain-text strings', () => {
				expect(
					nativeToRaw( [
						{ type: 'string', value: 'just' },
						{ type: 'string', value: ' a ' },
						{ type: 'string', value: 'string' },
					] )
				).toEqual( [ { type: 'string', value: 'just a string' } ] );
			} );

			test( 'should convert token formats', () => {
				expect(
					nativeToRaw( [
						{ type: 'siteName' },
						{ type: 'string', value: ' | ' },
						{ type: 'postTitle' },
					] )
				).toEqual( [
					{ type: 'token', value: 'site_name' },
					{ type: 'string', value: ' | ' },
					{ type: 'token', value: 'post_title' },
				] );
			} );
		} );

		describe( '#rawToNative', () => {
			test( 'should handle empty strings', () => {
				expect( rawToNative( [] ) ).toEqual( [] );
			} );

			test( 'should handle plain strings', () => {
				expect( rawToNative( [ { type: 'string', value: 'just a string' } ] ) ).toEqual( [
					{ type: 'string', value: 'just a string' },
				] );
			} );

			test( 'should convert token formats', () => {
				expect(
					rawToNative( [
						{ type: 'token', value: 'site_name' },
						{ type: 'string', value: ' | ' },
						{ type: 'token', value: 'post_title' },
					] )
				).toEqual( [
					{ type: 'siteName' },
					{ type: 'string', value: ' | ' },
					{ type: 'postTitle' },
				] );
			} );
		} );

		describe( '#fromApi', () => {
			test( 'should produce empty formats', () => {
				expect( fromApi( {} ) ).toEqual( {} );
			} );

			test( 'should remap keys and values', () => {
				expect(
					fromApi( {
						front_page: [
							{ type: 'token', value: 'site_name' },
							{ type: 'string', value: ' is awesome!' },
						],
						posts: [
							{ type: 'token', value: 'post_title' },
							{ type: 'string', value: ' | ' },
							{ type: 'token', value: 'site_name' },
						],
					} )
				).toEqual( {
					frontPage: [ { type: 'siteName' }, { type: 'string', value: ' is awesome!' } ],
					posts: [ { type: 'postTitle' }, { type: 'string', value: ' | ' }, { type: 'siteName' } ],
				} );
			} );
		} );

		describe( '#toApi', () => {
			test( 'should produce empty formats', () => {
				expect( toApi( {} ) ).toEqual( {} );
			} );

			test( 'should remap keys and values', () => {
				expect(
					toApi( {
						frontPage: [ { type: 'siteName' }, { type: 'string', value: ' is awesome!' } ],
						posts: [
							{ type: 'postTitle' },
							{ type: 'string', value: ' | ' },
							{ type: 'siteName' },
						],
					} )
				).toEqual( {
					front_page: [
						{ type: 'token', value: 'site_name' },
						{ type: 'string', value: ' is awesome!' },
					],
					posts: [
						{ type: 'token', value: 'post_title' },
						{ type: 'string', value: ' | ' },
						{ type: 'token', value: 'site_name' },
					],
				} );
			} );
		} );
	} );
} );
