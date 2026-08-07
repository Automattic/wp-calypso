/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import oauth2ClientsReducer from 'calypso/state/oauth2-clients/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SignupForm from '../index';

describe( 'SignupForm', () => {
	// Gravatar's screen is the only caller that wants its terms first; every other
	// screen takes the default, so nothing else would notice this being dropped.
	it( 'keeps the Gravatar terms above the button', () => {
		renderWithProvider( <SignupForm />, {
			initialState: {
				ui: { section: { name: 'signup' } },
				oauth2Clients: { ui: { currentClientId: 1854 }, items: { 1854: { id: 1854 } } },
			},
			reducers: { ui: uiReducer, oauth2Clients: oauth2ClientsReducer },
		} );

		expect(
			screen
				.getByText( /agree to our/ )
				.compareDocumentPosition( screen.getByRole( 'button', { name: 'Continue' } ) )
		).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
	} );
} );
