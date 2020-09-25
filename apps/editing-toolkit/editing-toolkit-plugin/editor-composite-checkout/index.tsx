/**
 * External dependencies
 */
import * as ReactDOM from 'react-dom';
import { ThemeProvider } from 'emotion-theming';
import { Checkout, CheckoutProvider, checkoutTheme } from '@automattic/composite-checkout';

function noop() {}

const items = [
	{
		label: 'Illudium Q-36 Explosive Space Modulator',
		id: 'space-modulator',
		type: 'widget',
		amount: { currency: 'USD', value: 5500, displayValue: '$55' },
	},
	{
		label: 'Air Jordans',
		id: 'sneakers',
		type: 'apparel',
		amount: { currency: 'USD', value: 12000, displayValue: '$120' },
	},
];

const total = {
	label: 'Total',
	id: 'total',
	type: 'total',
	amount: { currency: 'USD', value: 17500, displayValue: '$175' },
};

// When the upgrade button is clicked
document.addEventListener( 'mousedown', function ( event ) {
	if ( event.target.matches( '.jetpack-upgrade-plan-banner__wrapper a' ) ) {
		// stop it from redirecting to the checkout page
		event.preventDefault();
		event.stopPropagation();

		let modal = document.querySelector( '#wp-admin-checkout-modal' ) as HTMLDivElement;
		if ( ! modal ) {
			modal = document.createElement( 'div' ) as HTMLDivElement;
			modal.id = 'wp-admin-checkout-modal';
			Object.assign( modal.style, {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				background: '#fff',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			} );

			const CheckoutElement = (
				<>
					<div style={ { position: 'absolute', top: 10, right: 10 } }>
						<button onClick={ () => document.body.removeChild( modal ) }>×</button>
					</div>
					<ThemeProvider theme={ checkoutTheme }>
						<CheckoutProvider
							items={ items }
							total={ total }
							onPaymentComplete={ noop }
							showErrorMessage={ noop }
							showInfoMessage={ noop }
							showSuccessMessage={ noop }
							paymentMethods={ [] }
							paymentProcessors={ {
								mock: async () => ( { success: true } ),
							} }
						>
							<Checkout />
						</CheckoutProvider>
					</ThemeProvider>
				</>
			);

			document.body.appendChild( modal );
			ReactDOM.render( CheckoutElement, modal );
		}
	}
} );
