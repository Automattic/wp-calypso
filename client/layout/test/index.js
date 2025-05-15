import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import LayoutLoggedOut from '../logged-out';

jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );

describe( 'index', () => {
	describe( 'when trying to renderToString() LayoutLoggedOut', () => {
		test( "doesn't throw an exception", () => {
			expect( () => {
				renderToString(
					<Provider
						store={ {
							dispatch: () => {},
							getState: () => ( {
								ui: {},
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
						} }
					>
						<LayoutLoggedOut />
					</Provider>
				);
			} ).not.toThrow();
		} );
	} );
} );
