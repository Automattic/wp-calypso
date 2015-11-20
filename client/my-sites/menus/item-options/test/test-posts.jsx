
require( 'lib/react-test-env-setup' )();

/**
 * External Dependencies
 */
var	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	chai = require( 'chai' );

/**
 * Internal Dependencies
 */
var Posts = require( '../posts' ),
	siteMenus = require( 'lib/menu-data' ),
	helpers = require( 'my-sites/pages/helpers' );

chai.use( sinonChai );

describe( 'Posts' , function () {
	describe( 'maybeInjectPosts', function () {

		beforeEach( function () {
			this.itemToInject = {};
			this.siteMenusStub = sinon.stub( siteMenus, 'generateHomePageMenuItem', function () {
				return this.itemToInject;
			}.bind( this ) );
		} );

		afterEach( function () {
			this.siteMenusStub.restore();
		} );

		it( 'should inject when the menu type is "page"', function () {
			var postsNode = new Posts( {posts: [], type: "page" } ),
				injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts[0] ).to.equal( this.itemToInject );
		} );

		it( 'should not inject when the menu type is not "page"', function () {
			var postsNode = new Posts( {posts: [], type: "post" } ),
				injectedPosts = postsNode.maybeInjectPosts();
			chai.expect( injectedPosts.length ).to.equal( 0 );
		} );

		it( 'should inject with pass title to generator when there is a front page set', function () {
			var isFrontPageStub = sinon.stub( helpers, 'isFrontPage', function () { return true; } ),
				post = {title: 'Test'},
				postsNode = new Posts( { posts: [post], type: "page" } );
			postsNode.maybeInjectPosts();
			chai.expect( isFrontPageStub ).to.have.been.calledWith( post );
			chai.expect( this.siteMenusStub ).to.have.been.calledWith( post.title );

			isFrontPageStub.restore();
		} );


	} );
} );
