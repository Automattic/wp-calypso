/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useRtl } from 'i18n-calypso';
import ScrollableHorizontalNavigation from '../index';

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useRtl: jest.fn( () => false ),
} ) );

const mockUseRtl = useRtl as jest.Mock;

const tabs = [
	{ slug: 'one', title: 'One' },
	{ slug: 'two', title: 'Two' },
	{ slug: 'three', title: 'Three' },
];

function setScrollMetrics(
	element: HTMLElement,
	{
		scrollWidth,
		clientWidth,
		scrollLeft,
	}: {
		scrollWidth: number;
		clientWidth: number;
		scrollLeft: number;
	}
) {
	Object.defineProperty( element, 'scrollWidth', { configurable: true, value: scrollWidth } );
	Object.defineProperty( element, 'clientWidth', { configurable: true, value: clientWidth } );
	Object.defineProperty( element, 'scrollLeft', {
		configurable: true,
		writable: true,
		value: scrollLeft,
	} );
}

function getLeftWrapper(): HTMLElement {
	return document.querySelector(
		'.scrollable-horizontal-navigation__left-button-wrapper'
	) as HTMLElement;
}

function getRightWrapper(): HTMLElement {
	return document.querySelector(
		'.scrollable-horizontal-navigation__right-button-wrapper'
	) as HTMLElement;
}

function getTabsContainer(): HTMLElement {
	return document.querySelector( '.scrollable-horizontal-navigation__tabs' ) as HTMLElement;
}

describe( 'ScrollableHorizontalNavigation', () => {
	let resizeObserverCallback: ResizeObserverCallback;

	beforeEach( () => {
		mockUseRtl.mockReturnValue( false );
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback ) => {
			callback( 0 );
			return 0;
		} );
		jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation( () => undefined );
		Element.prototype.scrollIntoView = jest.fn();

		global.ResizeObserver = jest.fn( ( callback: ResizeObserverCallback ) => {
			resizeObserverCallback = callback;
			return {
				observe: jest.fn( () => {
					callback( [], {} as ResizeObserver );
				} ),
				unobserve: jest.fn(),
				disconnect: jest.fn(),
			};
		} ) as unknown as typeof ResizeObserver;
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	function renderNavigation( selectedTab = 'one' ) {
		return render(
			<ScrollableHorizontalNavigation
				selectedTab={ selectedTab }
				tabs={ tabs }
				onTabClick={ jest.fn() }
			/>
		);
	}

	async function applyScrollMetricsAndRecalculate( metrics: {
		scrollWidth: number;
		clientWidth: number;
		scrollLeft: number;
	} ) {
		setScrollMetrics( getTabsContainer(), metrics );

		await act( async () => {
			resizeObserverCallback( [], {} as ResizeObserver );
		} );

		await waitFor( () => {
			expect( getTabsContainer() ).toBeInTheDocument();
		} );
	}

	test( 'hides both arrows when content does not overflow', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( { scrollWidth: 200, clientWidth: 200, scrollLeft: 0 } );

		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'shows only the right button at the start of the scroll range', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( { scrollWidth: 500, clientWidth: 200, scrollLeft: 0 } );

		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );
	} );

	test( 'shows only the left button at the end of the scroll range', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 300,
		} );

		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'shows both buttons in the middle of the scroll range', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 150,
		} );

		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );
	} );

	test( 'hides arrows when within the scroll threshold of an edge', async () => {
		renderNavigation();

		// Near the physical left edge: left arrow stays hidden.
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 5,
		} );
		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );

		// Near the physical right edge: right arrow stays hidden.
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 295,
		} );
		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'normalizes negative RTL scroll positions to the same physical arrows', async () => {
		mockUseRtl.mockReturnValue( true );
		renderNavigation();

		// RTL start: scrollLeft is 0, only the right (physical) button shows.
		await applyScrollMetricsAndRecalculate( { scrollWidth: 500, clientWidth: 200, scrollLeft: 0 } );
		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );

		// RTL end: scrollLeft goes negative, only the left (physical) button shows.
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: -300,
		} );
		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'left and right buttons scroll toward their physical side in LTR', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 300,
			scrollLeft: 150,
		} );

		const container = getTabsContainer();
		const scrollBy = jest.fn();
		container.scrollBy = scrollBy as unknown as typeof container.scrollBy;

		fireEvent.click(
			document.querySelector( '.scrollable-horizontal-navigation__left-button' ) as HTMLElement
		);
		expect( scrollBy ).toHaveBeenLastCalledWith(
			expect.objectContaining( { left: -200, behavior: 'smooth' } )
		);

		fireEvent.click(
			document.querySelector( '.scrollable-horizontal-navigation__right-button' ) as HTMLElement
		);
		expect( scrollBy ).toHaveBeenLastCalledWith(
			expect.objectContaining( { left: 200, behavior: 'smooth' } )
		);
	} );

	test( 'RTL: right button scrolls toward start, left button toward end', async () => {
		mockUseRtl.mockReturnValue( true );
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 300,
			scrollLeft: -150,
		} );

		const container = getTabsContainer();
		const scrollBy = jest.fn();
		container.scrollBy = scrollBy as unknown as typeof container.scrollBy;

		fireEvent.click(
			document.querySelector( '.scrollable-horizontal-navigation__left-button' ) as HTMLElement
		);
		expect( scrollBy ).toHaveBeenLastCalledWith(
			expect.objectContaining( { left: 200, behavior: 'smooth' } )
		);

		fireEvent.click(
			document.querySelector( '.scrollable-horizontal-navigation__right-button' ) as HTMLElement
		);
		expect( scrollBy ).toHaveBeenLastCalledWith(
			expect.objectContaining( { left: -200, behavior: 'smooth' } )
		);
	} );

	test( 'does not use document.querySelector for arrow visibility', () => {
		const querySelectorSpy = jest.spyOn( document, 'querySelector' );

		renderNavigation();

		expect(
			querySelectorSpy.mock.calls.some( ( [ selector ] ) =>
				String( selector ).includes( 'scrollable-horizontal-navigation__' )
			)
		).toBe( false );

		querySelectorSpy.mockRestore();
	} );
} );
