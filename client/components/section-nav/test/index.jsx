/**
 * External dependencies
 */
import { assert } from 'chai';
import { noop } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

let	ReactDom, React, TestUtils, SectionNav;

function createComponent( component, props, children ) {
	const shallowRenderer = TestUtils.createRenderer();

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
		mockery.registerMock( 'lib/analytics', { ga: { recordEvent: noop } } );

		SectionNav = require( '../' );
	} );

	describe( 'rendering', function() {
		before( function() {
			const selectedText = 'test';
			const children = ( <p>mmyellow</p> );

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
			const elem = React.createElement( SectionNav, {
				selectedText: 'placeholder',
				onMobileNavPanelOpen: function() {
					done();
				}
			}, ( <p>placeholder</p> ) );
			const tree = TestUtils.renderIntoDocument( elem );
			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( tree.state.mobileOpen );
		} );

		it( 'should call onMobileNavPanelOpen function passed as a prop twice when tapped three times', function( done ) {
			const spy = sinon.spy();
			const elem = React.createElement( SectionNav, {
				selectedText: 'placeholder',
				onMobileNavPanelOpen: spy
			}, ( <p>placeholder</p> ) );
			const tree = TestUtils.renderIntoDocument( elem );

			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( tree.state.mobileOpen );

			assert( spy.calledTwice );
			done();
		} );
	} );
} );
