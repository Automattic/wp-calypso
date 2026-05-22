/**
 * @jest-environment jsdom
 */
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NicknameField from '../nickname-field';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str ) => str,
} ) );

// Access the mocked wpcom after module registry is set up.
const { req: wpcomReq } = require( 'calypso/lib/wp' );

describe( 'NicknameField', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders with initial value from user data', () => {
		render( <NicknameField initialNickname="JohnDoe" /> );
		expect( screen.getByDisplayValue( 'JohnDoe' ) ).toBeVisible();
	} );

	it( 'renders empty when no initial value is given', () => {
		render( <NicknameField /> );
		expect( screen.getByRole( 'textbox', { name: /nickname/i } ) ).toHaveValue( '' );
	} );

	it( 'syncs initial value when prop updates and user has not edited', () => {
		const { rerender } = render( <NicknameField initialNickname="" /> );
		rerender( <NicknameField initialNickname="LoadedNick" /> );
		expect( screen.getByDisplayValue( 'LoadedNick' ) ).toBeVisible();
	} );

	it( 'does not call the API if value has not changed on blur', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="unchanged" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.click( input );
		await user.tab(); // triggers blur

		expect( wpcomReq.post ).not.toHaveBeenCalled();
	} );

	it( 'does not save when blur value is empty', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.click( input );
		await user.tab();

		expect( wpcomReq.post ).not.toHaveBeenCalled();
	} );

	it( 'does not save whitespace-only value', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, '   ' );
		await user.tab();

		expect( wpcomReq.post ).not.toHaveBeenCalled();
	} );

	it( 'calls the API with trimmed, sanitized value on blur when value changed', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, '  Nick  ' );
		await user.tab();

		expect( wpcomReq.post ).toHaveBeenCalledWith(
			'/user/save-meta',
			{ apiVersion: '1.1' },
			{ meta_key: 'nickname', meta_value: 'Nick' }
		);
	} );

	it( 'strips HTML tags before saving', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, '<b>Bold</b>' );
		await user.tab();

		expect( wpcomReq.post ).toHaveBeenCalledWith(
			'/user/save-meta',
			{ apiVersion: '1.1' },
			{ meta_key: 'nickname', meta_value: 'Bold' }
		);
	} );

	it( 'shows saving indicator while request is in flight', async () => {
		const user = userEvent.setup();
		let resolveSave;
		wpcomReq.post.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveSave = resolve;
			} )
		);

		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, 'NewNick' );
		await user.tab();

		expect( screen.getByText( 'Saving\u2026' ) ).toBeVisible();
		expect( input ).toBeDisabled();

		// Resolve the request so effects can settle cleanly.
		await act( async () => {
			resolveSave( {} );
		} );
	} );

	it( 'shows success indicator and clears it after 2 seconds on successful save', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { delay: null } );
		wpcomReq.post.mockResolvedValue( {} );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, 'NewNick' );
		await user.tab();

		await waitFor( () => expect( screen.getByText( 'Saved' ) ).toBeVisible() );

		// After 2 seconds the "Saved" message should disappear.
		act( () => jest.advanceTimersByTime( 2000 ) );

		expect( screen.queryByText( 'Saved' ) ).toBeNull();

		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	it( 'shows error message on failed save', async () => {
		const user = userEvent.setup();
		wpcomReq.post.mockRejectedValue( new Error( 'Network error' ) );
		render( <NicknameField initialNickname="" /> );

		const input = screen.getByRole( 'textbox', { name: /nickname/i } );
		await user.type( input, 'ErrorNick' );
		await user.tab();

		await waitFor( () =>
			expect(
				screen.getByText( 'Failed to save nickname. Please try again.' )
			).toBeVisible()
		);
	} );
} );
