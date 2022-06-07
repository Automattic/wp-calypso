/**
 * @jest-environment jsdom
 */

import { get, omit } from 'lodash';
import * as helper from '../helper';
import * as fixtures from './fixtures';
jest.mock( '@automattic/calypso-config', () => {
	return () => require( './fixtures' ).discoverSiteId;
} );

describe( 'helper', () => {
	const { discoverPost } = fixtures;

	describe( 'isDiscoverPost', () => {
		test( 'returns true if discover metadata is present', () => {
			expect( helper.isDiscoverPost( discoverPost ) ).toBe( true );
		} );

		test( 'returns true if the site id is discovery_blog_id', () => {
			const withoutMetadata = omit( fixtures.discoverSiteFormat, 'discover_metadata' );
			expect( helper.isDiscoverPost( withoutMetadata ) ).toBe( true );
		} );

		test( 'returns false if the site is not disover or discover metadata is not present', () => {
			expect( helper.isDiscoverPost( fixtures.nonDiscoverPost ) ).toBe( false );
		} );

		test( 'returns false if the post is undefined', () => {
			expect( helper.isDiscoverPost() ).toBe( false );
		} );
	} );

	describe( 'isDiscoverSitePick', () => {
		test( 'returns true if the post is a site pick', () => {
			expect( helper.isDiscoverSitePick( fixtures.discoverSiteFormat ) ).toBe( true );
		} );

		test( 'returns false if the post is not a site pick', () => {
			expect( helper.isDiscoverSitePick( discoverPost ) ).toBe( false );
		} );

		test( 'returns false if the post is undefined', () => {
			expect( helper.isDiscoverSitePick() ).toBe( false );
		} );
	} );

	describe( 'isInternalDiscoverPost', () => {
		test( 'returns true if the post is internal to wpcom', () => {
			expect( helper.isInternalDiscoverPost( discoverPost ) ).toBe( true );
		} );

		test( 'returns false if the post is not internal to wpcom', () => {
			expect( helper.isInternalDiscoverPost( fixtures.externalDiscoverPost ) ).toBe( false );
		} );
	} );

	describe( 'getSiteUrl', () => {
		test( 'returns a reader route if the post is internal', () => {
			expect( helper.getSiteUrl( discoverPost ) ).toMatch( /^\/read\/blogs/ );
		} );

		test( 'returns the permalink if the post is not internal', () => {
			const permalink = get( fixtures.externalDiscoverPost, 'discover_metadata.permalink' );
			expect( permalink ).toEqual( helper.getSiteUrl( fixtures.externalDiscoverPost ) );
		} );

		test( 'returns undefined if the post is not a discover post', () => {
			expect( helper.getSiteUrl( fixtures.nonDiscoverPost ) ).not.toBeDefined();
		} );
	} );

	describe( 'hasSource', () => {
		test( 'returns true if the post is not a site pick', () => {
			expect( helper.hasSource( discoverPost ) ).toBe( true );
		} );

		test( 'returns false if the post is a site pick', () => {
			expect( helper.hasSource( fixtures.discoverSiteFormat ) ).toBe( false );
		} );

		test( 'returns false if the post is undefined', () => {
			expect( helper.hasSource() ).toBe( false );
		} );
	} );

	describe( 'getSourceData', () => {
		test( 'returns empty object if the post is not a discover post', () => {
			expect( {} ).toEqual( helper.getSourceData( fixtures.nonDiscoverPost ) );
		} );

		test( 'returns empty object if the post is external', () => {
			expect( {} ).toEqual( helper.getSourceData( fixtures.externalDiscoverPost ) );
		} );

		test( 'returns blog id if the post is a discover site pick', () => {
			const fixtureData = {
				blogId: get(
					fixtures.discoverSiteFormat,
					'discover_metadata.featured_post_wpcom_data.blog_id'
				),
				postId: undefined,
			};
			expect( fixtureData ).toEqual( helper.getSourceData( fixtures.discoverSiteFormat ) );
		} );

		test( 'returns the post and blog id', () => {
			const fixtureData = {
				blogId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.blog_id' ),
				postId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.post_id' ),
			};
			expect( fixtureData ).toEqual( helper.getSourceData( discoverPost ) );
		} );
	} );

	describe( 'getLinkProps', () => {
		test( 'returns empty props if the post is internal', () => {
			const siteUrl = helper.getSiteUrl( discoverPost );
			expect( helper.getLinkProps( siteUrl ) ).toEqual( { rel: '', target: '' } );
		} );

		test( 'returns props for external posts', () => {
			const siteUrl = helper.getSiteUrl( fixtures.externalDiscoverPost );
			expect( helper.getLinkProps( siteUrl ) ).toEqual( { rel: 'external', target: '_blank' } );
		} );
	} );

	describe( 'getSourceFollowUrl', () => {
		test( 'returns the site url if its a discover pick to an internal site', () => {
			const followUrl = helper.getSourceFollowUrl( discoverPost );
			expect( followUrl ).toEqual( get( discoverPost, 'discover_metadata.attribution.blog_url' ) );
		} );

		test( 'returns undefined if the post is not a discover pick', () => {
			const followUrl = helper.getSourceFollowUrl( fixtures.nonDiscoverPost );
			expect( followUrl ).not.toBeDefined();
		} );
	} );
} );
