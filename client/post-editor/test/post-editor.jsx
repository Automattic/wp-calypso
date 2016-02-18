require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const chai = require( 'chai' ),
	React = require( 'react' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	TestUtils = require( 'react-addons-test-utils' ),
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	mockery = require( 'mockery' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
const i18n = require( 'lib/mixins/i18n' ),
	PostEditStore = require( 'lib/posts/post-edit-store' ),
	SitesList = require( 'lib/sites-list/list' );

const expect = chai.expect;

const MOCK_COMPONENT = React.createClass( {
	render: function() {
		return null;
	}
} );

chai.use( sinonChai );

// Handle initialization here instead of in `before()` to avoid timeouts due to variability in time it takes for babel to compile
i18n.initialize();
ReactInjection.Class.injectMixin( i18n.mixin );

mockery.enable( {
	warnOnReplace: false,
	warnOnUnregistered: false
} );
mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
mockery.registerSubstitute( 'query', 'component-query' );
mockery.registerMock( 'component-classes', function() {
	return { add: noop, toggle: noop, remove: noop }
} );
mockery.registerMock( 'components/tinymce', MOCK_COMPONENT );
mockery.registerMock( 'components/popover', MOCK_COMPONENT );
mockery.registerMock( 'components/forms/clipboard-button', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-mobile-navigation', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-media-advanced', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-ground-control', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-drawer', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-author', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-visibility', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/editor-featured-image', MOCK_COMPONENT );
mockery.registerMock( './editor-preview', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/invalid-url-dialog', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/restore-post-dialog', MOCK_COMPONENT );
mockery.registerMock( 'post-editor/drafts-button', MOCK_COMPONENT );
mockery.registerMock( 'my-sites/drafts/draft-list', MOCK_COMPONENT );
mockery.registerMock( 'lib/layout-focus', {
	set() {}
} );
// TODO: REDUX - add proper tests when whole post-editor is reduxified
mockery.registerMock( 'react-redux', {
	connect: () => component => component
} );

const PostEditor = require( '../post-editor' );

describe( 'PostEditor', function() {
	let sandbox;

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

	describe( 'onEditedPostChange', function() {
		it( 'should clear content when store state transitions to isNew()', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					sites={ new SitesList() }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );

			tree.refs.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();
			expect( tree.refs.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should not clear content when store state already isNew()', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					sites={ new SitesList() }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );
			tree.refs.editor.setEditorContent = sandbox.spy();
			tree.setState( { isNew: true } );
			tree.onEditedPostChange();
			expect( tree.refs.editor.setEditorContent ).to.not.have.been.called;
		} );

		it( 'should clear content when loading', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					sites={ new SitesList() }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isLoading' );
			stub.returns( true );
			tree.refs.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();
			expect( tree.refs.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should set content after load', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					sites={ new SitesList() }
				/>
			);

			const content = 'loaded post';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content
			} );
			tree.refs.editor.setEditorContent = sandbox.spy();
			tree.setState( { isLoading: true } );
			tree.onEditedPostChange();
			expect( tree.refs.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		it( 'a normal content change should not clear content', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					sites={ new SitesList() }
				/>
			);

			const content = 'new content';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content
			} );
			tree.refs.editor.setEditorContent = sandbox.spy();
			tree.setState( { post: { content: 'old content' } } );
			tree.onEditedPostChange();

			expect( tree.refs.editor.setEditorContent ).to.not.have.been.called;
		} );
	} );
} );
