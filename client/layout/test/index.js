import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { RouteProvider } from 'calypso/components/route';
import LayoutLoggedOut from '../logged-out';

jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );

const store = {
	dispatch: () => {},
	getState: () => ( {
		currentUser: {
			id: null,
		},
		ui: {
			masterbarVisibility: true,
		},
		notices: {
			items: {},
		},
		purchases: {
			hasLoadedUserPurchasesFromServer: false,
		},
		sites: {
			items: {},
		},
	} ),
	subscribe: () => {},
};

describe( 'index', () => {
	describe( 'when trying to renderToString() LayoutLoggedOut', () => {
		test( "doesn't throw an exception", () => {
			expect( () => {
				renderToString(
					<Provider store={ store }>
						<LayoutLoggedOut />
					</Provider>
				);
			} ).not.toThrow();
		} );

		test( 'hides the masterbar on the WooCommerce QR login auth-check route', () => {
			const output = renderToString(
				<Provider store={ store }>
					<RouteProvider
						currentRoute="/me/security/qr-login"
						currentQuery={ { origin: 'woocommerce' } }
						currentSection={ { group: 'me', name: 'me', title: 'Me' } }
					>
						<LayoutLoggedOut />
					</RouteProvider>
				</Provider>
			);

			expect( output ).toContain( 'has-no-masterbar' );
			expect( output ).not.toContain( 'masterbar__loggedout' );
		} );
	} );
} );
