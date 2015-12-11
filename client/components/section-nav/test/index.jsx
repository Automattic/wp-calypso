var assert = require( 'chai' ).assert,
	sinon = require( 'sinon' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	mockery = require( 'mockery' ),
	TestUtils = React.addons.TestUtils,
	SectionNav;

var EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

require( 'lib/react-test-env-setup' )( '<html><body><script></script><div id="container"></div></body></html>' );
require( 'react-tap-event-plugin' )();

function createComponent( component, props, children ) {
	var shallowRenderer = React.addons.TestUtils.createRenderer();
	shallowRenderer.render(
		React.createElement( component, props, children )
	);
	return shallowRenderer.getRenderOutput();
}
describe( 'section-nav', function() {
	before( function() {
		mockery.registerMock( 'components/gridicon', EMPTY_COMPONENT );
		mockery.enable();
		mockery.warnOnUnregistered( false );

		SectionNav = require( '../' );
	} ),

	after( function() {
		mockery.deregisterMock( 'components/gridicon' );
		mockery.disable();
	} ),

	describe( 'rendering', function() {
		before( function() {
			var selectedText = 'test';
			var children = ( <p>mmyellow</p> );

			this.sectionNav = createComponent( SectionNav, {
				selectedText: selectedText
			}, children );

			this.panelElem = this.sectionNav.props.children[ 1 ];
			this.headerElem = this.sectionNav.props.children[ 0 ];
			this.headerTextElem = this.headerElem.props.children;
			this.text = this.headerTextElem.props.children;
		} );

		it( 'should render a header and a panel', function() {
			assert.equal( this.headerElem.props.className, 'section-nav__mobile-header' );
			assert.equal( this.panelElem.props.className, 'section-nav__panel' );
			assert.equal( this.headerTextElem.props.className, 'section-nav__mobile-header-text' );
		} );

		it( 'should render selectedText within mobile header', function() {
			assert.equal( this.text, 'test' );
		} );

		it( 'should render children', function( done ) {
			//React.Children.only should work here but gives an error about not being the only child
			React.Children.map( this.panelElem.props.children, function( obj ) {
				if ( obj.type === 'p' ) {
					assert.equal( obj.props.children, 'mmyellow' );
					done();
				}
			} );
		} );
	} );

	describe( 'interaction', function() {
		it( 'should call onMobileNavPanelOpen function passed as a prop when tapped', function( done ) {
			var elem = React.createElement( SectionNav, {
				selectedText: 'placeholder',
				onMobileNavPanelOpen: function() {
					done();
				}
			}, ( <p>placeholder</p> ) );
			var tree = TestUtils.renderIntoDocument( elem );
			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' ) ) );
			assert( tree.state.mobileOpen );
		} );

		it( 'should call onMobileNavPanelOpen function passed as a prop twice when tapped three times', function( done ) {
			var spy = sinon.spy();
			var elem = React.createElement( SectionNav, {
				selectedText: 'placeholder',
				onMobileNavPanelOpen: spy
			}, ( <p>placeholder</p> ) );
			var tree = TestUtils.renderIntoDocument( elem );

			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' ) ) );
			assert( tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' ) ) );
			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' ) ) );
			assert( tree.state.mobileOpen );

			assert( spy.calledTwice );
			done();
		} );
	} );
} );
