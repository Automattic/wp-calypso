/**
 * @jest-environment jsdom
 */
import { act, render, waitFor } from '@testing-library/react';
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
	Object.defineProperty( element, 'scrollWidth', {
		configurable: true,
		value: scrollWidth,
	} );
	Object.defineProperty( element, 'clientWidth', {
		configurable: true,
		value: clientWidth,
	} );
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
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 200,
			clientWidth: 200,
			scrollLeft: 0,
		} );

		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'shows only the end arrow at scroll start in LTR', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 0,
		} );

		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );
	} );

	test( 'shows only the start arrow at scroll end in LTR', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 300,
		} );

		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'shows both arrows in the middle of the scroll range in LTR', async () => {
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 150,
		} );

		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );
	} );

	test( 'shows only the end arrow at scroll start in RTL', async () => {
		mockUseRtl.mockReturnValue( true );
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: 0,
		} );

		expect( getLeftWrapper() ).not.toHaveClass( 'display-none' );
		expect( getRightWrapper() ).toHaveClass( 'display-none' );
	} );

	test( 'shows only the start arrow at scroll end in RTL', async () => {
		mockUseRtl.mockReturnValue( true );
		renderNavigation();
		await applyScrollMetricsAndRecalculate( {
			scrollWidth: 500,
			clientWidth: 200,
			scrollLeft: -300,
		} );

		expect( getLeftWrapper() ).toHaveClass( 'display-none' );
		expect( getRightWrapper() ).not.toHaveClass( 'display-none' );
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
