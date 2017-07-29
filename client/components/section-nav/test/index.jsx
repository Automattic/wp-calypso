/**
 * @jest-environment jsdom
 */
jest.mock( 'gridicons', () => require( 'components/empty-component' ) );
jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {}
	}
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import SectionNav from '../';

function createComponent( component, props, children ) {
	const shallowRenderer = TestUtils.createRenderer();

	shallowRenderer.render(
		React.createElement( component, props, children )
	);
	return shallowRenderer.getRenderOutput();
}

describe( 'section-nav', function() {
	describe( 'rendering', function() {
		let headerElem, headerTextElem, panelElem, sectionNav, text;

		before( function() {
			const selectedText = 'test';
			const children = ( <p>mmyellow</p> );

			sectionNav = createComponent( SectionNav, {
				selectedText: selectedText
			}, children );

			panelElem = sectionNav.props.children[ 1 ];
			headerElem = sectionNav.props.children[ 0 ];
			headerTextElem = headerElem.props.children;
			text = headerTextElem.props.children;
		} );

		it( 'should render a header and a panel', function() {
			assert.equal( headerElem.props.className, 'section-nav__mobile-header' );
			assert.equal( panelElem.props.className, 'section-nav__panel' );
			assert.equal( headerTextElem.props.className, 'section-nav__mobile-header-text' );
		} );

		it( 'should render selectedText within mobile header', function() {
			assert.equal( text, 'test' );
		} );

		it( 'should render children', function( done ) {
			//React.Children.only should work here but gives an error about not being the only child
			React.Children.map( panelElem.props.children, function( obj ) {
				if ( obj.type === 'p' ) {
					assert.equal( obj.props.children, 'mmyellow' );
					done();
				}
			} );
		} );

		it( 'should not render a header if dropdown disabled', () => {
			const component = createComponent( SectionNav, {
				selectedText: 'test',
				allowDropdown: false,
			}, ( <p>mmyellow</p> ) );

			assert.notEqual( component.props.children[ 0 ].className, 'section-nav__mobile-header' );
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
			TestUtils.Simulate.click( ReactDom.findDOMNode(
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
			TestUtils.Simulate.click( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( tree.state.mobileOpen );
			TestUtils.Simulate.click( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( ! tree.state.mobileOpen );
			TestUtils.Simulate.click( ReactDom.findDOMNode(
				TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
			) );
			assert( tree.state.mobileOpen );

			assert( spy.calledTwice );
			done();
		} );
	} );
} );
