/**
 * @jest-environment jsdom
 */
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { screen, fireEvent } from '@testing-library/react';
import { EditGravatar } from 'calypso/blocks/edit-gravatar';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@gravatar-com/quick-editor', () => ( {
	GravatarQuickEditorCore: jest.fn().mockImplementation( ( options ) => ( {
		// Fire the callback to simulate the profile update.
		open: jest.fn( () => options.onProfileUpdated?.() ),
	} ) ),
} ) );

jest.mock( 'calypso/state/selectors/get-user-settings', () => jest.fn( () => {} ) );

const FIXED_NOW = 1_706_790_000_000; // 2025-03-05 00:00 UTC
jest.spyOn( Date, 'now' ).mockReturnValue( FIXED_NOW );

const userProp = {
	email_verified: true,
	display_name: 'arbitrary-user-display-name',
};

const baseProps = {
	translate: ( i ) => i,
	recordClickButtonEvent: jest.fn(),
	recordAvatarUpdatedEvent: jest.fn(),
	setCurrentUser: jest.fn(),
};

const setup = ( overrides = {} ) =>
	renderWithProvider( <EditGravatar { ...baseProps } { ...overrides } /> );

describe( 'EditGravatar', () => {
	afterEach( jest.clearAllMocks );

	describe( 'renders', () => {
		test( 'editable Gravatar', () => {
			setup( { user: userProp } );
			expect( screen.getByAltText( userProp.display_name ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: /Edit your public avatar/i } ) ).toBeVisible();
		} );

		test( 'unverified email', () => {
			setup( { user: { ...userProp, email_verified: false } } );
			expect( screen.getByTestId( 'caution-icon' ) ).toBeVisible();
			expect(
				screen.getByRole( 'button', { name: /Verify your email to edit your avatar/i } )
			).toBeVisible();
		} );

		test( 'Gravatar disabled', () => {
			setup( { user: userProp, isGravatarProfileHidden: true } );
			expect( screen.getByTestId( 'hidden-avatar' ) ).toBeVisible();
			expect( screen.getByText( /Your avatar is hidden\./ ) ).toBeVisible();
		} );
	} );

	describe( 'actions', () => {
		test( 'opens quick editor and updates user', () => {
			setup( { user: userProp } );

			fireEvent.click( screen.getByRole( 'button', { name: /Edit your public avatar/i } ) );

			const quickEditor = GravatarQuickEditorCore.mock.results.at( -1 ).value;
			expect( quickEditor.open ).toHaveBeenCalledTimes( 1 );

			expect( baseProps.setCurrentUser ).toHaveBeenCalledWith(
				expect.objectContaining( {
					avatar_URL: expect.stringContaining( `ver=${ FIXED_NOW }` ),
				} )
			);
		} );

		test( 'shows email‑verification dialog', () => {
			setup( { user: { ...userProp, email_verified: false } } );

			fireEvent.click(
				screen.getByRole( 'button', { name: /Verify your email to edit your avatar/i } )
			);

			// Check for dialog modal copy to ensure it appeared.
			expect( screen.getByText( /Secure your account and access more features\./ ) ).toBeVisible();
		} );
	} );
} );
