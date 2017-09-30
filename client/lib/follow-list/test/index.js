/** @jest-environment jsdom */
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

var assert = require( 'chai' ).assert,
	sinon = require( 'sinon' );

describe( 'index', function() {
	var FollowList, FollowListSite, followList, site;

	before( () => {
		FollowList = require( 'lib/follow-list' );
		FollowListSite = require( 'lib/follow-list/site' );
		followList = new FollowList();
		site = new FollowListSite( { site_id: 95327318, is_following: false } );
	} );

	describe( 'FollowList', function() {
		describe( 'add', function() {
			it( 'should add a site', function() {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.equal( followList.data.length, 1 );
			} );

			it( 'should create an instance of FollowListSite', function() {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.isTrue( followList.data[ 0 ] instanceof FollowListSite );
			} );

			it( 'should not add a duplicate site_id', function() {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.equal( followList.data.length, 1 );
				followList.add( { site_id: 95327318, is_following: false } );
				followList.add( { site_id: 71611100, is_following: false } );
				assert.equal( followList.data.length, 2 );
			} );
		} );
	} );

	describe( 'FollowListSite', function() {
		describe( 'instantiation', function() {
			it( 'should set the attributes', function() {
				assert.equal( site.site_id, 95327318 );
				assert.equal( site.is_following, false );
			} );
		} );

		describe( 'follow', function() {
			it( 'should call the follow endpoint and execute the callback', function() {
				var changeCallback = sinon.spy();
				site.on( 'change', changeCallback );
				site.follow();
				assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
				assert.isTrue( site.is_following );
			} );

			it( 'should not call the follow endpoint or execute the callback if already following', function() {
				var changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.follow();
				assert.isFalse( changeCallback.called, 'callbacks subscribed to change should not called' );
				assert.isTrue( site.is_following );
			} );
		} );

		describe( 'unfollow', function() {
			it( 'should call the unfollow endpoint and execute the callback', function() {
				var changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.unfollow();
				assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
				assert.isFalse( site.is_following );
			} );

			it( 'should not call the unfollow endpoint or execute the callback if already following', function() {
				var changeCallback = sinon.spy();
				site.is_following = false;
				site.on( 'change', changeCallback );
				site.unfollow();
				assert.isFalse( changeCallback.called, 'callbacks subscribed to change should not called' );
				assert.isFalse( site.is_following );
			} );
		} );
	} );
} );
