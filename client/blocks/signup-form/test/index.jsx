/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SignupForm from '../index';

jest.mock( 'calypso/lib/oauth2-clients', () => ( {
	...jest.requireActual( 'calypso/lib/oauth2-clients' ),
	isGravatarOAuth2Client: () => true,
} ) );

describe( 'SignupForm', () => {
	// Gravatar's screen is the one place terms come first, and the only caller that
	// asks for it; every other screen takes the default.
	it( 'keeps the Gravatar terms above the button', () => {
		renderWithProvider( <SignupForm />, {
			initialState: { ui: { section: { name: 'signup' } } },
			reducers: { ui: uiReducer },
		} );

		expect(
			screen
				.getByText( /agree to our/ )
				.compareDocumentPosition( screen.getByRole( 'button', { name: 'Continue' } ) )
		).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
	} );
} );
