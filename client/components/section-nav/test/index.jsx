/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// SectionNav clones children with internal props; a component child consumes them instead
// of leaking unknown attributes onto a DOM element (which React warns about).
const Panel = ( { children } ) => <div>{ children }</div>;

describe( 'section-nav', () => {
	describe( 'rendering', () => {
		test( 'should render a header and a panel', () => {
			const { container } = render(
				<SectionNav selectedText="test">
					<Panel>mmyellow</Panel>
				</SectionNav>
			);

			expect( container.querySelector( '.section-nav__mobile-header' ) ).toBeVisible();
			expect( container.querySelector( '.section-nav__panel' ) ).toBeVisible();
			expect( container.querySelector( '.section-nav__mobile-header-text' ) ).toBeVisible();
		} );

		test( 'should render selectedText within mobile header', () => {
			const { container } = render(
				<SectionNav selectedText="test">
					<Panel>mmyellow</Panel>
				</SectionNav>
			);

			expect( container.querySelector( '.section-nav__mobile-header-text' ) ).toHaveTextContent(
				'test'
			);
		} );

		test( 'should render children', () => {
			render(
				<SectionNav selectedText="test">
					<Panel>mmyellow</Panel>
				</SectionNav>
			);

			expect( screen.getByText( 'mmyellow' ) ).toBeVisible();
		} );

		test( 'should not render a header if dropdown disabled', () => {
			const { container } = render(
				<SectionNav selectedText="test" allowDropdown={ false }>
					<Panel>mmyellow</Panel>
				</SectionNav>
			);

			expect( container.querySelector( '.section-nav__mobile-header' ) ).not.toBeInTheDocument();
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
		test( 'should toggle the panel and call onMobileNavPanelOpen twice when tapped three times', async () => {
			const onMobileNavPanelOpen = jest.fn();
			const { container } = render(
				<SectionNav selectedText="placeholder" onMobileNavPanelOpen={ onMobileNavPanelOpen }>
					<Panel>placeholder</Panel>
				</SectionNav>
			);
			const nav = container.querySelector( '.section-nav' );
			const header = screen.getByRole( 'button' );

			expect( nav ).not.toHaveClass( 'is-open' );
			await userEvent.click( header );
			expect( nav ).toHaveClass( 'is-open' );
			await userEvent.click( header );
			expect( nav ).not.toHaveClass( 'is-open' );
			await userEvent.click( header );
			expect( nav ).toHaveClass( 'is-open' );

			expect( onMobileNavPanelOpen ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
