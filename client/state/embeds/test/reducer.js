/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { siteItems, urlItems } from '../reducer';
import { EMBED_RECEIVE, EMBEDS_RECEIVE } from 'state/action-types';

jest.mock( 'state/embeds/utils', () => ( {
	normalizeEmbeds: ( embeds ) => embeds,
} ) );

describe( 'reducer', () => {
	const siteId = 12345678;

	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );
		expect( state ).toMatchSnapshot();
	} );

	describe( 'siteItems', () => {
		const embeds = [ 'something' ];

		test( 'should default to an empty object', () => {
			const state = siteItems( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add normalized embeds per site to the initial state', () => {
			const state = siteItems( deepFreeze( {} ), {
				type: EMBEDS_RECEIVE,
				siteId,
				embeds,
			} );

			expect( state ).toEqual( {
				[ siteId ]: embeds,
			} );
		} );

		test( 'should overwrite embeds of the site if they already exist', () => {
			const state = siteItems(
				deepFreeze( {
					[ siteId ]: [ 'old-embeds-pattern' ],
				} ),
				{
					type: EMBEDS_RECEIVE,
					siteId,
					embeds,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: embeds,
			} );
		} );

		test( 'should add embeds of another site, keeping the existing ones', () => {
			const otherSiteId = 87654321;
			const otherEmbeds = [ 'something-else' ];
			const state = siteItems(
				deepFreeze( {
					[ siteId ]: embeds,
				} ),
				{
					type: EMBEDS_RECEIVE,
					siteId: otherSiteId,
					embeds: otherEmbeds,
				}
			);

			expect( state ).toEqual( {
				...state,
				[ otherSiteId ]: otherEmbeds,
			} );
		} );
	} );

	describe( 'urlItems', () => {
		const url = 'https://www.facebook.com/20531316728/posts/10154009990506729/';
		const sourceEmbed = {
			result: 'something',
			scripts: { foo: 'bar' },
			styles: {},
		};
		const resultEmbed = {
			body: sourceEmbed.result,
			scripts: sourceEmbed.scripts,
			styles: sourceEmbed.styles,
		};

		test( 'should default to an empty object', () => {
			const state = urlItems( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add embeds per site and per url to the initial state', () => {
			const state = urlItems( deepFreeze( {} ), {
				type: EMBED_RECEIVE,
				siteId,
				url,
				embed: sourceEmbed,
			} );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ url ]: resultEmbed,
				},
			} );
		} );

		test( 'should overwrite the embed if it exists for that site and url', () => {
			const state = urlItems(
				deepFreeze( {
					[ siteId ]: {
						[ url ]: {
							foo: 'bar',
						},
					},
				} ),
				{
					type: EMBED_RECEIVE,
					siteId,
					url,
					embed: sourceEmbed,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ url ]: resultEmbed,
				},
			} );
		} );

		test( 'should add embeds of another site, keeping the existing ones', () => {
			const otherSiteId = 87654321;
			const state = urlItems(
				deepFreeze( {
					[ siteId ]: {
						[ url ]: {
							foo: 'bar',
						},
					},
				} ),
				{
					type: EMBED_RECEIVE,
					siteId: otherSiteId,
					url,
					embed: sourceEmbed,
				}
			);

			expect( state ).toEqual( {
				...state,
				[ otherSiteId ]: {
					[ url ]: resultEmbed,
				},
			} );
		} );

		test( 'should add embeds to the same site, keeping the existing ones', () => {
			const otherUrl = 'https://www.facebook.com/';
			const state = urlItems(
				deepFreeze( {
					[ siteId ]: {
						[ url ]: {
							foo: 'bar',
						},
					},
				} ),
				{
					type: EMBED_RECEIVE,
					siteId,
					url: otherUrl,
					embed: sourceEmbed,
				}
			);

			expect( state ).toEqual( {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ otherUrl ]: resultEmbed,
				},
			} );
		} );
	} );
} );
