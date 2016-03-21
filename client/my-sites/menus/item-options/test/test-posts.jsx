/**
 * External Dependencies
 */
import chai from 'chai';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import helpers from 'my-sites/pages/helpers';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'Posts', function() {
	let Posts, siteMenus;
	useFakeDom();
	useSandbox();

	before( function() {
		Posts = require( '../posts' );
		siteMenus = require( 'lib/menu-data' );
	} );

	describe( 'maybeInjectPosts', function() {
		beforeEach( function() {
			this.itemToInject = {};
			siteMenus.generateNewPageMenuItem = () => ( {} );
			this.siteMenusStub = this.sandbox.stub( siteMenus, 'generateHomePageMenuItem', function() {
				return this.itemToInject;
			}.bind( this ) );
		} );

		afterEach( function() {
			this.sandbox.restore();
		} );

		it( 'should inject when the menu type is "page"', function() {
			var postsNode = new Posts( {posts: [], type: 'page' } ),
				injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts[0] ).to.equal( this.itemToInject );
		} );

		it( 'should not inject when the menu type is not "page"', function() {
			var postsNode = new Posts( {posts: [], type: 'post' } ),
				injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts.length ).to.equal( 0 );
		} );

		it( 'should inject with pass title to generator when there is a front page set', function() {
			var isFrontPageStub = this.sandbox.stub( helpers, 'isFrontPage', () => true ),
				post = {title: 'Test'},
				postsNode = new Posts( { posts: [post], type: 'page' } );
			postsNode.maybeInjectPosts();
			chai.expect( isFrontPageStub ).to.have.been.calledWith( post );
			chai.expect( this.siteMenusStub ).to.have.been.calledWith( post.title );
		} );
	} );
} );
