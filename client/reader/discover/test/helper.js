/**
 * External dependencies
 */
import { assert } from 'chai';
import { get, omit } from 'lodash';

/**
 * Internal dependencies
 */

import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

import * as fixtures from './fixtures';

describe( 'helper', () => {
	const { discoverPost } = fixtures;
	let helper;
	useMockery( ( mockery ) => {
		mockery.registerMock( 'config', () => fixtures.discoverSiteId );
		mockery.registerMock( 'lib/user/utils', { getLocaleSlug: () => 'en' } );
	} );

	useFakeDom();

	before( () => {
		helper = require( '../helper' );
	} );

	describe( 'isDiscoverPost', () => {
		it( 'returns true if discover metadata is present', () => {
			assert.isTrue( helper.isDiscoverPost( discoverPost ) );
		} );

		it( 'returns true if the site id is discovery_blog_id', () => {
			const withoutMetadata = omit( fixtures.discoverSiteFormat, 'discover_metadata' );
			assert.isTrue( helper.isDiscoverPost( withoutMetadata ) );
		} );

		it( 'returns false if the site is not disover or discover metadata is not present', () => {
			assert.isFalse( helper.isDiscoverPost( fixtures.nonDiscoverPost ) );
		} );

		it( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.isDiscoverPost( ) );
		} );
	} );

	describe( 'isDiscoverSitePick', () => {
		it( 'returns true if the post is a site pick', () => {
			assert.isTrue( helper.isDiscoverSitePick( fixtures.discoverSiteFormat ) );
		} );

		it( 'returns false if the post is not a site pick', () => {
			assert.isFalse( helper.isDiscoverSitePick( discoverPost ) );
		} );

		it( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.isDiscoverSitePick( ) );
		} );
	} );

	describe( 'isInternalDiscoverPost', () =>{
		it( 'returns true if the post is internal to wpcom', () => {
			assert.isTrue( helper.isInternalDiscoverPost( discoverPost ) );
		} );

		it( 'returns false if the post is not internal to wpcom', () => {
			assert.isFalse( helper.isInternalDiscoverPost( fixtures.externalDiscoverPost ) );
		} );
	} );

	describe( 'getSiteUrl', () => {
		it( 'returns a reader route if the post is internal', () => {
			assert.match( helper.getSiteUrl( discoverPost ), /^\/read\/blogs/ );
		} );

		it( 'returns the permalink if the post is not internal', () => {
			const permalink = get( fixtures.externalDiscoverPost, 'discover_metadata.permalink' );
			assert.equal( permalink, helper.getSiteUrl( fixtures.externalDiscoverPost ) );
		}	);

		it( 'returns undefined if the post is not a discover post', () => {
			assert.isUndefined( helper.getSiteUrl( fixtures.nonDiscoverPost ) );
		} );
	} );

	describe( 'hasSource', () => {
		it( 'returns true if the post is not a site pick', () => {
			assert.isTrue( helper.hasSource( discoverPost ) );
		} );

		it( 'returns false if the post is a site pick', () => {
			assert.isFalse( helper.hasSource( fixtures.discoverSiteFormat ) );
		} );

		it( 'returns false if the post is undefined', () => {
			assert.isFalse( helper.hasSource( ) );
		}	);
	} );

	describe( 'getSourceData', () => {
		it( 'returns null if the post is not a discover post', () => {
			assert.isNull( helper.getSourceData( fixtures.nonDiscoverPost ) );
		} );

		it( 'returns null if the post is external', () => {
			assert.isNull( helper.getSourceData( fixtures.externalDiscoverPost ) );
		} );

		it( 'returns null if the post is a discover site pick', () => {
			assert.isNull( helper.getSourceData( fixtures.discoverSiteFormat ) );
		} );

		it( 'returns the post and blog id', () => {
			const fixtureData = {
				blogId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.blog_id' ),
				postId: get( discoverPost, 'discover_metadata.featured_post_wpcom_data.post_id' )
			};
			assert.deepEqual( fixtureData, helper.getSourceData( discoverPost ) );
		} );
	} );

	describe( 'getLinkProps', () => {
		it( 'returns empty props if the post is internal', () => {
			const siteUrl = helper.getSiteUrl( discoverPost );
			assert.deepEqual( helper.getLinkProps( siteUrl ), { rel: '', target: '' } );
		} );

		it( 'returns props for external posts', () => {
			const siteUrl = helper.getSiteUrl( fixtures.externalDiscoverPost );
			assert.deepEqual( helper.getLinkProps( siteUrl ), { rel: 'external', target: '_blank' } );
		} );
	} );

	describe( 'getSourceFollowUrl', () => {
		it( 'returns the site url if its a discover pick to an internal site', () => {
			const followUrl = helper.getSourceFollowUrl( discoverPost );
			assert.equal( followUrl, get( discoverPost, 'discover_metadata.attribution.blog_url' ) );
		} );

		it( 'returns an empty string if the discover pick is to an external site', () => {
			const followUrl = helper.getSourceFollowUrl( fixtures.externalDiscoverPost );
			assert.equal( followUrl, '' );
		} );

		it( 'returns undefined if the post is not a discover pick', () => {
			const followUrl = helper.getSourceFollowUrl( fixtures.nonDiscoverPost );
			assert.isUndefined( followUrl );
		} );
	}	);
} );
