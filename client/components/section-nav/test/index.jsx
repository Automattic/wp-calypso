/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { createElement, Children } from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import ShallowRenderer from 'react-test-renderer/shallow';
import SectionNav from '../';
import NavItem from '../item';
import NavTabs from '../tabs';

jest.mock( 'calypso/lib/analytics/ga', () => ( {
	recordEvent: () => {},
} ) );

window.IntersectionObserver = jest.fn( () => ( {
	observe: jest.fn(),
	disconnect: jest.fn(),
	root: null,
	rootMargin: '',
	thresholds: [],
	takeRecords: jest.fn(),
	unobserve: jest.fn(),
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

	describe( 'Nav Tabs', () => {
		afterEach( () => {
			Object.defineProperty( window, 'innerWidth', { value: 1024 } );
		} );

		test( 'should not contain has-horizontal-scroll class if window width < 480px and NavTabs hasHorizontalScroll true', () => {
			Object.defineProperty( window, 'innerWidth', { value: 400 } );

			render(
				<NavTabs label="Status" hasHorizontalScroll>
					<NavItem path="/demo" selected>
						Demo
					</NavItem>
				</NavTabs>
			);

			const horizontalScrollClass = document.getElementsByClassName( 'has-horizontal-scroll' )[ 0 ];
			expect( horizontalScrollClass ).toBeUndefined();
		} );

		test( 'should contain has-horizontal-scroll class if window width > 480px and NavTabs hasHorizontalScroll true', () => {
			Object.defineProperty( window, 'innerWidth', { value: 800 } );

			render(
				<SectionNav selectedText="Test">
					<NavTabs label="Status" hasHorizontalScroll>
						<NavItem path="/demo" selected>
							Demo
						</NavItem>
					</NavTabs>
				</SectionNav>
			);

			const horizontalScrollClass = document.getElementsByClassName( 'has-horizontal-scroll' )[ 0 ];
			expect( horizontalScrollClass ).toBeInTheDocument();
		} );

		test( 'should not contain has-horizontal-scroll class if window width > 480px and NavTabs hasHorizontalScroll false', () => {
			Object.defineProperty( window, 'innerWidth', { value: 800 } );

			render(
				<SectionNav selectedText="Test">
					<NavTabs label="Status" hasHorizontalScroll={ false }>
						<NavItem path="/demo" selected>
							Demo
						</NavItem>
					</NavTabs>
				</SectionNav>
			);

			const horizontalScrollClass = document.getElementsByClassName( 'has-horizontal-scroll' )[ 0 ];
			expect( horizontalScrollClass ).toBeUndefined();
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
} );
