/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import sinon from 'sinon';
import ShallowRenderer from 'react-test-renderer/shallow';

/**
 * Internal dependencies
 */
import SectionNav from '../';

jest.mock( 'gridicons', () => require( 'components/empty-component' ) );
jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {},
	},
} ) );

function createComponent( component, props, children ) {
	const renderer = new ShallowRenderer();

	renderer.render( React.createElement( component, props, children ) );
	return renderer.getRenderOutput();
}

describe( 'section-nav', () => {
	describe( 'rendering', () => {
		let headerElem, headerTextElem, panelElem, sectionNav, text;

		beforeAll( function() {
			const selectedText = 'test';
			const children = <p>mmyellow</p>;

			sectionNav = createComponent(
				SectionNav,
				{
					selectedText: selectedText,
				},
				children
			);

			panelElem = sectionNav.props.children[ 1 ];
			headerElem = sectionNav.props.children[ 0 ];
			headerTextElem = headerElem.props.children;
			text = headerTextElem.props.children;
		} );

		test( 'should render a header and a panel', () => {
			expect( headerElem.props.className ).toEqual( 'section-nav__mobile-header' );
			expect( panelElem.props.className ).toEqual( 'section-nav__panel' );
			expect( headerTextElem.props.className ).toEqual( 'section-nav__mobile-header-text' );
		} );

		test( 'should render selectedText within mobile header', () => {
			expect( text ).toEqual( 'test' );
		} );

		test( 'should render children', done => {
			//React.Children.only should work here but gives an error about not being the only child
			React.Children.map( panelElem.props.children, function( obj ) {
				if ( obj.type === 'p' ) {
					expect( obj.props.children ).toEqual( 'mmyellow' );
					done();
				}
			} );
		} );

		test( 'should not render a header if dropdown disabled', () => {
			const component = createComponent(
				SectionNav,
				{
					selectedText: 'test',
					allowDropdown: false,
				},
				<p>mmyellow</p>
			);

			expect( component.props.children[ 0 ].className ).not.toEqual( 'section-nav__mobile-header' );
		} );
	} );

	describe( 'interaction', () => {
		test( 'should call onMobileNavPanelOpen function passed as a prop when tapped', done => {
			const elem = React.createElement(
				SectionNav,
				{
					selectedText: 'placeholder',
					onMobileNavPanelOpen: function() {
						done();
					},
				},
				<p>placeholder</p>
			);
			const tree = TestUtils.renderIntoDocument( elem );
			expect( ! tree.state.mobileOpen ).toBeTruthy();
			TestUtils.Simulate.click(
				ReactDom.findDOMNode(
					TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
				)
			);
			expect( tree.state.mobileOpen ).toBeTruthy();
		} );

		test( 'should call onMobileNavPanelOpen function passed as a prop twice when tapped three times', done => {
			const spy = sinon.spy();
			const elem = React.createElement(
				SectionNav,
				{
					selectedText: 'placeholder',
					onMobileNavPanelOpen: spy,
				},
				<p>placeholder</p>
			);
			const tree = TestUtils.renderIntoDocument( elem );

			expect( ! tree.state.mobileOpen ).toBeTruthy();
			TestUtils.Simulate.click(
				ReactDom.findDOMNode(
					TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
				)
			);
			expect( tree.state.mobileOpen ).toBeTruthy();
			TestUtils.Simulate.click(
				ReactDom.findDOMNode(
					TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
				)
			);
			expect( ! tree.state.mobileOpen ).toBeTruthy();
			TestUtils.Simulate.click(
				ReactDom.findDOMNode(
					TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
				)
			);
			expect( tree.state.mobileOpen ).toBeTruthy();

			expect( spy.calledTwice ).toBeTruthy();
			done();
		} );
	} );
} );
