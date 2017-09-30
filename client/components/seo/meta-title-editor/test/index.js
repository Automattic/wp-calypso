import { expect } from 'chai';

import {
	nativeToRaw,
	rawToNative,
	fromApi,
	toApi,
} from '../mappings';

describe( 'SEO', () => {
	describe( 'Title Format Editor', () => {
		describe( '#nativeToRaw', () => {
			it( 'should produce empty formats', () => {
				expect(
					nativeToRaw( [] )
				).to.eql( [] );
			} );

			it( 'should produce plain-text strings', () => {
				expect(
					nativeToRaw( [
						{ type: 'string', value: 'just' },
						{ type: 'string', value: ' a ' },
						{ type: 'string', value: 'string' },
					] )
				).to.eql( [ { type: 'string', value: 'just a string' } ] );
			} );

			it( 'should convert token formats', () => {
				expect(
					nativeToRaw( [
						{ type: 'siteName' },
						{ type: 'string', value: ' | ' },
						{ type: 'postTitle' }
					] )
				).to.eql( [
					{ type: 'token', value: 'site_name' },
					{ type: 'string', value: ' | ' },
					{ type: 'token', value: 'post_title' },
				] );
			} );
		} );

		describe( '#rawToNative', () => {
			it( 'should handle empty strings', () => {
				expect(
					rawToNative( [] )
				).to.eql( [] );
			} );

			it( 'should handle plain strings', () => {
				expect(
					rawToNative( [ { type: 'string', value: 'just a string' } ] )
				).to.eql( [ { type: 'string', value: 'just a string' } ] );
			} );

			it( 'should convert token formats', () => {
				expect(
					rawToNative( [
						{ type: 'token', value: 'site_name' },
						{ type: 'string', value: ' | ' },
						{ type: 'token', value: 'post_title' },
					] )
				).to.eql( [
					{ type: 'siteName' },
					{ type: 'string', value: ' | ' },
					{ type: 'postTitle' },
				] );
			} );
		} );

		describe( '#fromApi', () => {
			it( 'should produce empty formats', () => {
				expect(
					fromApi( {} )
				).to.eql( {} );
			} );

			it( 'should remap keys and values', () => {
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
				).to.eql( {
					frontPage: [
						{ type: 'siteName' },
						{ type: 'string', value: ' is awesome!' },
					],
					posts: [
						{ type: 'postTitle' },
						{ type: 'string', value: ' | ' },
						{ type: 'siteName' },
					],
				} );
			} );
		} );

		describe( '#toApi', () => {
			it( 'should produce empty formats', () => {
				expect(
					toApi( {} )
				).to.eql( {} );
			} );

			it( 'should remap keys and values', () => {
				expect(
					toApi( {
						frontPage: [
							{ type: 'siteName' },
							{ type: 'string', value: ' is awesome!' },
						],
						posts: [
							{ type: 'postTitle' },
							{ type: 'string', value: ' | ' },
							{ type: 'siteName' },
						],
					} )
				).to.eql( {
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
