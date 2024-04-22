/**
 * @jest-environment jsdom
 */
import { createElement, Children } from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import ShallowRenderer from 'react-test-renderer/shallow';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SectionNav from '../';

jest.mock( 'calypso/lib/analytics/ga', () => ( {
	recordEvent: () => {},
} ) );

function createComponent( component, props, children ) {
	const renderer = new ShallowRenderer();

	renderer.render( createElement( component, props, children ) );
	return renderer.getRenderOutput();
}

describe( 'section-nav', () => {
	describe( 'rendering', () => {
		let headerElem;
		let headerTextElem;
		let panelElem;
		let sectionNav;
		let text;

		beforeAll( function () {
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
			headerTextElem = headerElem.props.children[ 0 ];
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

		test( 'should render children', () => {
			return new Promise( ( done ) => {
				//React.Children.only should work here but gives an error about not being the only child
				Children.map(
					panelElem.props.children.filter( ( o ) => o.type === 'p' ),
					function ( obj ) {
						expect( obj.props.children ).toEqual( 'mmyellow' );
						done();
					}
				);
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

			const header = component.props.children.find(
				( child ) => child && child.className === 'section-nav__mobile-header'
			);
			expect( header ).toBeUndefined();
		} );
	} );

	describe( 'interaction', () => {
		test( 'should call onMobileNavPanelOpen function passed as a prop when tapped', () => {
			return new Promise( ( done ) => {
				const elem = createElement(
					SectionNav,
					{
						selectedText: 'placeholder',
						onMobileNavPanelOpen: function () {
							done();
						},
					},
					<p>placeholder</p>
				);
				const tree = TestUtils.renderIntoDocument( elem );
				expect( tree.state.mobileOpen ).toBe( false );
				TestUtils.Simulate.click(
					ReactDom.findDOMNode(
						TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
					)
				);
				expect( tree.state.mobileOpen ).toBe( true );
			} );
		} );

		test( 'should call onMobileNavPanelOpen function passed as a prop twice when tapped three times', () => {
			return new Promise( ( done ) => {
				const spy = jest.fn();
				const elem = createElement(
					SectionNav,
					{
						selectedText: 'placeholder',
						onMobileNavPanelOpen: spy,
					},
					<p>placeholder</p>
				);
				const tree = TestUtils.renderIntoDocument( elem );

				expect( tree.state.mobileOpen ).toBe( false );
				TestUtils.Simulate.click(
					ReactDom.findDOMNode(
						TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
					)
				);
				expect( tree.state.mobileOpen ).toBe( true );
				TestUtils.Simulate.click(
					ReactDom.findDOMNode(
						TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
					)
				);
				expect( tree.state.mobileOpen ).toBe( false );
				TestUtils.Simulate.click(
					ReactDom.findDOMNode(
						TestUtils.findRenderedDOMComponentWithClass( tree, 'section-nav__mobile-header' )
					)
				);
				expect( tree.state.mobileOpen ).toBe( true );

				expect( spy ).toHaveBeenCalledTimes( 2 );
				done();
			} );
		} );
	} );

	describe( 'Nav Tabs', () => {
		test( 'should render the mobile header if dropdown is enabled and NavTabs hasHorizontalScroll true', () => {
			const children = createComponent(
				NavTabs,
				{
					label: 'NavTabs',
					hasHorizontalScroll: true,
				},
				<NavItem path="/demo" selected>
					Demo
				</NavItem>
			);

			const component = createComponent(
				SectionNav,
				{
					selectedText: 'Test',
					allowDropdown: true,
				},
				children
			);

			const header = component.props.children.find(
				( child ) => child && child.props && child.props.className === 'section-nav__mobile-header'
			);
			expect( header ).toBeDefined();
		} );

		test( 'should not render the mobile header if dropdown is not enabled and NavTabs hasHorizontalScroll true', () => {
			const children = createComponent(
				NavTabs,
				{
					label: 'NavTabs',
					hasHorizontalScroll: true,
				},
				<NavItem path="/demo" selected>
					Demo
				</NavItem>
			);

			const component = createComponent(
				SectionNav,
				{
					selectedText: 'Test',
					allowDropdown: false,
				},
				children
			);

			const header = component.props.children.find(
				( child ) => child && child.props && child.props.className === 'section-nav__mobile-header'
			);
			expect( header ).toBeUndefined();
		} );
	} );
} );
