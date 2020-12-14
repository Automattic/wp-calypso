/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import FollowList from 'calypso/lib/follow-list';
import FollowListSite from 'calypso/lib/follow-list/site';

jest.mock( 'calypso/lib/wp', () => require( './mocks/lib/wp' ) );

describe( 'index', () => {
	let followList;
	let site;

	beforeAll( () => {
		followList = new FollowList();
		site = new FollowListSite( { site_id: 95327318, is_following: false } );
	} );

	describe( 'FollowList', () => {
		describe( 'add', () => {
			test( 'should add a site', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.equal( followList.data.length, 1 );
			} );

			test( 'should create an instance of FollowListSite', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.isTrue( followList.data[ 0 ] instanceof FollowListSite );
			} );

			test( 'should not add a duplicate site_id', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				assert.equal( followList.data.length, 1 );
				followList.add( { site_id: 95327318, is_following: false } );
				followList.add( { site_id: 71611100, is_following: false } );
				assert.equal( followList.data.length, 2 );
			} );
		} );
	} );

	describe( 'FollowListSite', () => {
		describe( 'instantiation', () => {
			test( 'should set the attributes', () => {
				assert.equal( site.site_id, 95327318 );
				assert.equal( site.is_following, false );
			} );
		} );

		describe( 'follow', () => {
			test( 'should call the follow endpoint and execute the callback', () => {
				const changeCallback = sinon.spy();
				site.on( 'change', changeCallback );
				site.follow();
				assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
				assert.isTrue( site.is_following );
			} );

			test( 'should not call the follow endpoint or execute the callback if already following', () => {
				const changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.follow();
				assert.isFalse( changeCallback.called, 'callbacks subscribed to change should not called' );
				assert.isTrue( site.is_following );
			} );
		} );

		describe( 'unfollow', () => {
			test( 'should call the unfollow endpoint and execute the callback', () => {
				const changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.unfollow();
				assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
				assert.isFalse( site.is_following );
			} );

			test( 'should not call the unfollow endpoint or execute the callback if already following', () => {
				const changeCallback = sinon.spy();
				site.is_following = false;
				site.on( 'change', changeCallback );
				site.unfollow();
				assert.isFalse( changeCallback.called, 'callbacks subscribed to change should not called' );
				assert.isFalse( site.is_following );
			} );
		} );
	} );
} );
