/**
 * @format
 * @jest-environment jsdom
 */

jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

import sinon from 'sinon';

describe( 'index', () => {
	var FollowList, FollowListSite, followList, site;

	beforeAll( () => {
		FollowList = require( 'lib/follow-list' );
		FollowListSite = require( 'lib/follow-list/site' );
		followList = new FollowList();
		site = new FollowListSite( { site_id: 95327318, is_following: false } );
	} );

	describe( 'FollowList', () => {
		describe( 'add', () => {
			test( 'should add a site', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				expect( followList.data.length ).toEqual( 1 );
			} );

			test( 'should create an instance of FollowListSite', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				expect( followList.data[ 0 ] instanceof FollowListSite ).toBe( true );
			} );

			test( 'should not add a duplicate site_id', () => {
				followList.add( { site_id: 95327318, is_following: false } );
				expect( followList.data.length ).toEqual( 1 );
				followList.add( { site_id: 95327318, is_following: false } );
				followList.add( { site_id: 71611100, is_following: false } );
				expect( followList.data.length ).toEqual( 2 );
			} );
		} );
	} );

	describe( 'FollowListSite', () => {
		describe( 'instantiation', () => {
			test( 'should set the attributes', () => {
				expect( site.site_id ).toEqual( 95327318 );
				expect( site.is_following ).toEqual( false );
			} );
		} );

		describe( 'follow', () => {
			test( 'should call the follow endpoint and execute the callback', () => {
				var changeCallback = sinon.spy();
				site.on( 'change', changeCallback );
				site.follow();
				expect( changeCallback.called ).toBe( true );
				expect( site.is_following ).toBe( true );
			} );

			test( 'should not call the follow endpoint or execute the callback if already following', () => {
				var changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.follow();
				expect( changeCallback.called ).toBe( false );
				expect( site.is_following ).toBe( true );
			} );
		} );

		describe( 'unfollow', () => {
			test( 'should call the unfollow endpoint and execute the callback', () => {
				var changeCallback = sinon.spy();
				site.is_following = true;
				site.on( 'change', changeCallback );
				site.unfollow();
				expect( changeCallback.called ).toBe( true );
				expect( site.is_following ).toBe( false );
			} );

			test( 'should not call the unfollow endpoint or execute the callback if already following', () => {
				var changeCallback = sinon.spy();
				site.is_following = false;
				site.on( 'change', changeCallback );
				site.unfollow();
				expect( changeCallback.called ).toBe( false );
				expect( site.is_following ).toBe( false );
			} );
		} );
	} );
} );
