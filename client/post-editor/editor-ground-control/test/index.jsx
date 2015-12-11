/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	moment = require( 'moment' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var EditorGroundControl;

/**
 * Module variables
 */
var MOCK_COMPONENT = React.createClass( {
	render: function() {
		return null;
	}
} );

var MOCK_SITE = {
	capabilities: {
		publish_posts: true
	},
	options: {}
};

var expect = chai.expect;

chai.use( sinonChai );

describe( 'EditorGroundControl', function() {
	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'components/card', MOCK_COMPONENT );
		mockery.registerMock( 'components/popover', MOCK_COMPONENT );
		mockery.registerMock( 'my-sites/site', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/edit-post-status', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/status-label', MOCK_COMPONENT );
		mockery.registerMock( 'components/sticky-panel', MOCK_COMPONENT );
		mockery.registerMock( 'components/post-schedule', MOCK_COMPONENT );
		EditorGroundControl = require( '../' );
		EditorGroundControl.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
		EditorGroundControl.prototype.__reactAutoBindMap.moment = moment;
	} );

	beforeEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	after( function() {
		delete EditorGroundControl.prototype.__reactAutoBindMap.translate;
		delete EditorGroundControl.prototype.__reactAutoBindMap.moment;
		mockery.deregisterAll();
		mockery.disable();
	} );

	describe( '#getPreviewLabel()', function() {
		it( 'should return View if the site is a Jetpack site and the post is published', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					site={ { jetpack: true } }
				/>,
				document.body
			);

			expect( tree.getPreviewLabel() ).to.equal( 'View' );
		} );

		it( 'should return Preview if the post was not originally published', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { status: 'publish' } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPreviewLabel() ).to.equal( 'Preview' );
		} );
	} );

	describe( '#getPrimaryButtonLabel()', function() {
		it( 'should return Update if the post was originally published and is still slated to be published', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { status: 'publish' } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post was originally published and is currently reverted to non-published status', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Schedule if the post is dated in the future and not scheduled', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { date: nextMonth } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Schedule if the post is dated in the future and published', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { date: nextMonth } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Update if the post is scheduled and dated in the future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'future', date: nextMonth } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post is scheduled, dated in the future, and next status is draft', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'draft', date: nextMonth } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Publish if the post is scheduled and dated in the past', function() {
			var now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'future', date: lastMonth } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return Publish if the post is a draft', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return "Submit for Review" if the post is a draft and user can\'t publish', function() {
			var tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					site={ {
						capabilities: {
							publish_posts: false
						}
					} }
				/>,
				document.body
			);

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Submit for Review' );
		} );
	} );

	describe( '#isSaveEnabled()', function() {
		it( 'should return false if form is saving', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaving />, document.body );

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaveBlocked />, document.body );

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if post does not exist', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaving={ false } hasContent isDirty />, document.body );

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return true if dirty and post has content and post is not published', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaving={ false } post={ {} } hasContent isDirty />, document.body );

			expect( tree.isSaveEnabled() ).to.be.true;
		} );

		it( 'should return false if dirty, but post has no content', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaving={ false } isDirty />, document.body );

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if dirty and post is published', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaving={ false } post={ { status: 'publish' } } isDirty />, document.body );

			expect( tree.isSaveEnabled() ).to.be.false;
		} );
	} );

	describe( '#isPreviewEnabled()', function() {
		it( 'should return true if post is not empty', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } isNew hasContent isDirty />, document.body );

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaveBlocked />, document.body );

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		it( 'should return true even if form is publishing', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } hasContent isPublishing />, document.body );

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		it( 'should return false if not dirty', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } isDirty={ false } isNew />, document.body );

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		it( 'should return false if post has no content', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } hasContent={ false } />, document.body );

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );
	} );

	describe( '#isPrimaryButtonEnabled()', function() {
		it( 'should return true if form is not publishing and post is not empty', function() {
			var tree = ReactDom.render( <EditorGroundControl isPublishing={ false } post={ {} } hasContent isDirty isNew />, document.body );

			expect( tree.isPrimaryButtonEnabled() ).to.be.true;
		} );

		it( 'should return false if form is publishing', function() {
			var tree = ReactDom.render( <EditorGroundControl isPublishing />, document.body );

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = ReactDom.render( <EditorGroundControl isSaveBlocked />, document.body );

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if not dirty', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } isDirty={ false } isNew />, document.body );

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if post has no content', function() {
			var tree = ReactDom.render( <EditorGroundControl post={ {} } hasContent={ false } />, document.body );

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );
	} );

	describe( '#onPrimaryButtonClick', function() {
		it( 'should publish a draft', function() {
			var onPublish = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					post={ { status: 'draft' } }
					site={ MOCK_SITE }
					onPublish={ onPublish }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should schedule a posted dated in future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onSave = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft', date: nextMonth } }
					post={ { title: 'change', status: 'draft', date: nextMonth } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'future' );
		} );

		it( 'should save a scheduled post dated in future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onSave = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'future', date: nextMonth } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'future' );
		} );

		it( 'should publish a scheduled post dated in past', function() {
			var now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				onPublish = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'future', date: lastMonth } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					onPublish={ onPublish }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should update a published post that has changed status', function() {
			var onSave = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { title: 'change', status: 'draft' } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.called;
		} );

		it( 'should set status to "pending" if the user can\'t publish', function() {
			var onSave = sinon.spy(),
				tree;

			tree = ReactDom.render(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					onSave={ onSave }
					site={ {
						capabilities: {
							publish_posts: false
						}
					} }
				/>,
				document.body
			);

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'pending' );
		} );
	} );
} );
