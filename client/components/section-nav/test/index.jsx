var assert = require( 'chai' ).assert,
	sinon = require( 'sinon' ),
	useMockery = require( 'test/helpers/use-mockery' ),
	useFakeDom = require( 'test/helpers/use-fake-dom' ),
	ReactDom, React, TestUtils, SectionNav;

function createComponent( component, props, children ) {
	var shallowRenderer = TestUtils.createRenderer();
	shallowRenderer.render(
		React.createElement( component, props, children )
	);
	return shallowRenderer.getRenderOutput();
}

describe( 'section-nav', function() {
	useFakeDom( '<html><body><script></script><div id="container"></div></body></html>' );

	useMockery( mockery => {
		ReactDom = require( 'react-dom' );
		React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );
		require( 'react-tap-event-plugin' )();

		const EMPTY_COMPONENT = require( 'test/helpers/react/empty-component' );

		mockery.registerMock( 'components/gridicon', EMPTY_COMPONENT );

		SectionNav = require( '../' );
	} );

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
