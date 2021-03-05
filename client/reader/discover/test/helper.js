/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { get, omit } from 'lodash';

/**
 * Internal dependencies
 */
import * as helper from '../helper';
import * as fixtures from './fixtures';
jest.mock( '@automattic/calypso-config', () => {
	return () => require( './fixtures' ).discoverSiteId;
} );
jest.mock( 'calypso/lib/user/utils', () => ( { getLocaleSlug: () => 'en' } ) );

describe( 'helper', () => {
	const { discoverPost } = fixtures;

	describe( 'isDiscoverPost', () => {
		test( 'returns true if discover metadata is present', () => {
			assert.isTrue( helper.isDiscoverPost( discoverPost ) );
		} );

		test( 'returns true if the site id is discovery_blog_id', () => {
			const withoutMetadata = omit( fixtures.discoverSiteFormat, 'discover_metadata' );
			assert.isTrue( helper.isDiscoverPost( withoutMetadata ) );
		} );

		test( 'returns false if the site is not disover or discover metadata is not present', () => {
			assert.isFalse( helper.isDiscoverPost( fixtures.nonDiscoverPost ) );
		} );

		test( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.isDiscoverPost() );
		} );
	} );

	describe( 'isDiscoverSitePick', () => {
		test( 'returns true if the post is a site pick', () => {
			assert.isTrue( helper.isDiscoverSitePick( fixtures.discoverSiteFormat ) );
		} );

		test( 'returns false if the post is not a site pick', () => {
			assert.isFalse( helper.isDiscoverSitePick( discoverPost ) );
		} );

		test( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.isDiscoverSitePick() );
		} );
	} );

	describe( 'isInternalDiscoverPost', () => {
		test( 'returns true if the post is internal to wpcom', () => {
			assert.isTrue( helper.isInternalDiscoverPost( discoverPost ) );
		} );

		test( 'returns false if the post is not internal to wpcom', () => {
			assert.isFalse( helper.isInternalDiscoverPost( fixtures.externalDiscoverPost ) );
		} );
	} );

	describe( 'getSiteUrl', () => {
		test( 'returns a reader route if the post is internal', () => {
			assert.match( helper.getSiteUrl( discoverPost ), /^\/read\/blogs/ );
		} );

		test( 'returns the permalink if the post is not internal', () => {
			const permalink = get( fixtures.externalDiscoverPost, 'discover_metadata.permalink' );
			assert.equal( permalink, helper.getSiteUrl( fixtures.externalDiscoverPost ) );
		} );

		test( 'returns undefined if the post is not a discover post', () => {
			assert.isUndefined( helper.getSiteUrl( fixtures.nonDiscoverPost ) );
		} );
	} );

	describe( 'hasSource', () => {
		test( 'returns true if the post is not a site pick', () => {
			assert.isTrue( helper.hasSource( discoverPost ) );
		} );

		test( 'returns false if the post is a site pick', () => {
			assert.isFalse( helper.hasSource( fixtures.discoverSiteFormat ) );
		} );

		test( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.hasSource() );
		} );
	} );

	describe( 'getSourceData', () => {
		test( 'returns empty object if the post is not a discover post', () => {
			assert.deepEqual( {}, helper.getSourceData( fixtures.nonDiscoverPost ) );
		} );

		test( 'returns empty object if the post is external', () => {
			assert.deepEqual( {}, helper.getSourceData( fixtures.externalDiscoverPost ) );
		} );

		test( 'returns blog id if the post is a discover site pick', () => {
			const fixtureData = {
				blogId: get(
					fixtures.discoverSiteFormat,
					'discover_metadata.featured_post_wpcom_data.blog_id'
				),
				postId: undefined,
			};
			assert.deepEqual( fixtureData, helper.getSourceData( fixtures.discoverSiteFormat ) );
		} );

		test( 'returns the post and blog id', () => {
			const fixtureData = {
				blogId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.blog_id' ),
				postId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.post_id' ),
			};
			assert.deepEqual( fixtureData, helper.getSourceData( discoverPost ) );
		} );
	} );

	describe( 'getLinkProps', () => {
		test( 'returns empty props if the post is internal', () => {
			const siteUrl = helper.getSiteUrl( discoverPost );
			assert.deepEqual( helper.getLinkProps( siteUrl ), { rel: '', target: '' } );
		} );

		test( 'returns props for external posts', () => {
			const siteUrl = helper.getSiteUrl( fixtures.externalDiscoverPost );
			assert.deepEqual( helper.getLinkProps( siteUrl ), { rel: 'external', target: '_blank' } );
		} );
	} );

	describe( 'getSourceFollowUrl', () => {
		test( 'returns the site url if its a discover pick to an internal site', () => {
			const followUrl = helper.getSourceFollowUrl( discoverPost );
			assert.equal( followUrl, get( discoverPost, 'discover_metadata.attribution.blog_url' ) );
		} );

		test( 'returns undefined if the post is not a discover pick', () => {
			const followUrl = helper.getSourceFollowUrl( fixtures.nonDiscoverPost );
			assert.isUndefined( followUrl );
		} );
	} );
} );
