/**
 * @jest-environment jsdom
 */

import { CheckoutProvider } from '@automattic/composite-checkout';
import { render } from '@testing-library/react';
import { CheckoutSubmitButtonContent } from '../checkout-submit-button-content';

jest.mock( '../../../use-cart-key', () => ( { __esModule: true, default: () => 'no-site' } ) );
jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: () => ( { responseCart: { total_cost_integer: 1000 } } ),
} ) );
jest.mock( '../../hooks/use-mobile-checkout-sticky-summary-experiment', () => ( {
	useMobileCheckoutStickySummaryExperiment: () => ( { isMobileCheckoutStickySummary: false } ),
} ) );

/**
 * Mimics browser page-translation: replaces text nodes React manages with a
 * `<font>` wrapper, leaving React's reference to the original node detached.
 */
function simulateTranslation( root: HTMLElement, text: string ) {
	const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT );
	const matches: Text[] = [];
	let node = walker.nextNode();
	while ( node ) {
		if ( node.nodeValue?.includes( text ) ) {
			matches.push( node as Text );
		}
		node = walker.nextNode();
	}
	expect( matches.length ).toBeGreaterThan( 0 );
	for ( const textNode of matches ) {
		const font = document.createElement( 'font' );
		font.textContent = textNode.nodeValue;
		textNode.replaceWith( font );
	}
}

describe( 'CheckoutSubmitButtonContent under browser page-translation', () => {
	let consoleError: jest.SpyInstance;
	beforeEach( () => {
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );
	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'survives the cart finishing validation', () => {
		const onPageLoadError = jest.fn();
		const ui = ( isValidating: boolean ) => (
			<CheckoutProvider
				paymentMethods={ [] }
				paymentProcessors={ {} }
				isValidating={ isValidating }
				onPageLoadError={ onPageLoadError }
			>
				<button>
					<CheckoutSubmitButtonContent />
				</button>
			</CheckoutProvider>
		);

		const { container, rerender } = render( ui( true ) );
		simulateTranslation( container, 'Please wait' );
		rerender( ui( false ) );

		expect( onPageLoadError ).not.toHaveBeenCalled();
	} );

	test( 'survives the cart starting validation', () => {
		const onPageLoadError = jest.fn();
		const ui = ( isValidating: boolean ) => (
			<CheckoutProvider
				paymentMethods={ [] }
				paymentProcessors={ {} }
				isValidating={ isValidating }
				onPageLoadError={ onPageLoadError }
			>
				<button>
					<CheckoutSubmitButtonContent />
				</button>
			</CheckoutProvider>
		);

		const { container, rerender } = render( ui( false ) );
		simulateTranslation( container, 'Pay now' );
		rerender( ui( true ) );

		expect( onPageLoadError ).not.toHaveBeenCalled();
	} );
} );
