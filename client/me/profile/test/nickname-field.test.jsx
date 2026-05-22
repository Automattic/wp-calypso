/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NicknameField from '../nickname-field';

const mockPost = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			post: ( ...args ) => mockPost( ...args ),
		},
	},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text ) => text,
} ) );

describe( 'NicknameField', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.runAllTimers();
		jest.useRealTimers();
	} );

	it( 'renders the Nickname input with the correct pre-populated value', () => {
		render( <NicknameField initialNickname="coolguy" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		expect( input ).toBeVisible();
		expect( input ).toHaveValue( 'coolguy' );
	} );

	it( 'does not call the API when blurring without changing the value', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		render( <NicknameField initialNickname="coolguy" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.click( input );
		await user.tab();
		expect( mockPost ).not.toHaveBeenCalled();
	} );

	it( 'calls POST /user/save-meta with correct payload on blur when value changed', async () => {
		mockPost.mockResolvedValue( { success: true } );
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		render( <NicknameField initialNickname="coolguy" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.clear( input );
		await user.type( input, 'newnick' );
		await user.tab();
		expect( mockPost ).toHaveBeenCalledWith( '/user/save-meta', {
			meta_key: 'nickname',
			meta_value: 'newnick',
		} );
	} );

	it( 'shows Saved indicator on success', async () => {
		mockPost.mockResolvedValue( { success: true } );
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		render( <NicknameField initialNickname="coolguy" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.clear( input );
		await user.type( input, 'newnick' );
		await user.tab();
		await waitFor( () => expect( screen.getByText( 'Saved' ) ).toBeVisible() );
	} );

	it( 'shows error message on API failure', async () => {
		mockPost.mockRejectedValue( new Error( 'API error' ) );
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		render( <NicknameField initialNickname="coolguy" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.clear( input );
		await user.type( input, 'newnick' );
		await user.tab();
		await waitFor( () =>
			expect(
				screen.getByText( 'Failed to save nickname. Please try again.' )
			).toBeVisible()
		);
	} );

	it( 'validates and shows error for invalid characters', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		render( <NicknameField initialNickname="bad@name!" /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.click( input );
		await user.tab();
		expect(
			screen.getByText( 'Nickname contains invalid characters or exceeds 50 characters.' )
		).toBeVisible();
		expect( mockPost ).not.toHaveBeenCalled();
	} );

	it( 'validates and shows error for value exceeding 50 characters', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime, delay: null } );
		const longNickname = 'a'.repeat( 51 );
		render( <NicknameField initialNickname={ longNickname } /> );
		const input = screen.getByRole( 'textbox', { name: 'Nickname' } );
		await user.click( input );
		await user.tab();
		expect(
			screen.getByText( 'Nickname contains invalid characters or exceeds 50 characters.' )
		).toBeVisible();
		expect( mockPost ).not.toHaveBeenCalled();
	} );
} );
