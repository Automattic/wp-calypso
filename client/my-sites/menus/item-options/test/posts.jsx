/**
 * External Dependencies
 */
import chai from 'chai';
import path from 'path';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

describe( 'Posts', function() {
	let Posts, siteMenus, helpers;
	useFakeDom();
	useSandbox();

	const menuDataPath = path.dirname( require.resolve( 'lib/menu-data' ) );
	useFilesystemMocks( menuDataPath + '/test' );

	before( function() {
		Posts = require( '../posts' );
		siteMenus = require( 'lib/menu-data' );
		helpers = require( 'my-sites/pages/helpers' );
	} );

	describe( 'maybeInjectPosts', function() {
		beforeEach( function() {
			this.itemToInject = {};
			siteMenus.generateNewPageMenuItem = () => {};
			this.siteMenusStub = this.sandbox.stub( siteMenus, 'generateHomePageMenuItem', () => this.itemToInject );
		} );

		afterEach( function() {
			this.sandbox.restore();
		} );

		it( 'should inject when the menu type is "page"', function() {
			const postsNode = new Posts( {posts: [], type: 'page' } );
			const injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts[0] ).to.equal( this.itemToInject );
		} );

		it( 'should not inject when the menu type is not "page"', function() {
			const postsNode = new Posts( {posts: [], type: 'post' } );
			const injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts.length ).to.equal( 0 );
		} );

		it( 'should inject with pass title to generator when there is a front page set', function() {
			const isFrontPageStub = this.sandbox.stub( helpers, 'isFrontPage', () => true );
			const post = { title: 'Test' };
			const postsNode = new Posts( { posts: [ post ], type: 'page' } );
			postsNode.maybeInjectPosts();
			chai.expect( isFrontPageStub ).to.have.been.calledWith( post );
			chai.expect( this.siteMenusStub ).to.have.been.calledWith( post.title );
		} );
	} );
} );
