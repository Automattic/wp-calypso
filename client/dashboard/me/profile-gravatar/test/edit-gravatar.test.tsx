/**
 * @jest-environment jsdom
 */
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render } from '../../../test-utils';
import EditGravatar from '../edit-gravatar';

// Mock window.matchMedia for @wordpress/components
window.matchMedia = jest.fn( ( query ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: jest.fn(),
	removeListener: jest.fn(),
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	dispatchEvent: jest.fn(),
} ) );

// Mock the quick editor
const mockOpen = jest.fn();
const mockClose = jest.fn();

jest.mock( '@gravatar-com/quick-editor', () => ( {
	GravatarQuickEditorCore: jest.fn().mockImplementation( () => ( {
		open: mockOpen,
		close: mockClose,
		isOpen: jest.fn( () => false ),
	} ) ),
} ) );

const defaultProps = {
	avatarUrl: 'https://gravatar.com/avatar/test',
	userEmail: 'test@example.com',
	isEmailVerified: true,
};

describe( 'EditGravatar', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'rendering modes', () => {
		it( 'renders button-only mode when showAvatarPreview is false', () => {
			render( <EditGravatar { ...defaultProps } showAvatarPreview={ false } /> );

			// Should show the "Update avatar" button
			expect( screen.getByRole( 'button', { name: 'Update avatar' } ) ).toBeVisible();

			// Should NOT show an avatar image
			expect( screen.queryByRole( 'img' ) ).not.toBeInTheDocument();
		} );

		it( 'renders full avatar preview mode by default', () => {
			render( <EditGravatar { ...defaultProps } /> );

			// Should show the avatar image
			expect( screen.getByAltText( 'Gravatar' ) ).toBeVisible();

			// Should show the "Update" button
			expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeVisible();

			// Should have accessible buttons for the avatar area (button wraps inner div with role=button)
			const avatarButtons = screen.getAllByRole( 'button', { name: 'Change profile photo' } );
			expect( avatarButtons.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'email verification notice', () => {
		it( 'shows verification notice when unverified user clicks button in button-only mode', async () => {
			const user = userEvent.setup();
			render(
				<EditGravatar { ...defaultProps } isEmailVerified={ false } showAvatarPreview={ false } />
			);

			// Click the "Update avatar" button
			await user.click( screen.getByRole( 'button', { name: 'Update avatar' } ) );

			// Verification notice should appear
			expect(
				screen.getByText( 'Please verify your email address to change your profile photo.' )
			).toBeVisible();

			// Close button should be visible
			expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeVisible();
		} );

		it( 'closes verification notice when Close button is clicked', async () => {
			const user = userEvent.setup();
			render(
				<EditGravatar { ...defaultProps } isEmailVerified={ false } showAvatarPreview={ false } />
			);

			// Click to show notice
			await user.click( screen.getByRole( 'button', { name: 'Update avatar' } ) );

			// Click Close button
			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

			// Notice should be hidden
			expect(
				screen.queryByText( 'Please verify your email address to change your profile photo.' )
			).not.toBeInTheDocument();
		} );

		it( 'shows verification notice when unverified user clicks button in full preview mode', async () => {
			const user = userEvent.setup();
			render( <EditGravatar { ...defaultProps } isEmailVerified={ false } /> );

			// Click the "Update" button
			await user.click( screen.getByRole( 'button', { name: 'Update' } ) );

			// Verification notice should appear
			expect(
				screen.getByText( 'Please verify your email address to change your profile photo.' )
			).toBeVisible();
		} );
	} );

	describe( 'quick editor integration', () => {
		it( 'opens quick editor when verified user clicks button', async () => {
			const user = userEvent.setup();
			render( <EditGravatar { ...defaultProps } /> );

			// Click the "Update" button
			await user.click( screen.getByRole( 'button', { name: 'Update' } ) );

			// Quick editor should be opened
			expect( mockOpen ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not open quick editor for unverified user', async () => {
			const user = userEvent.setup();
			render( <EditGravatar { ...defaultProps } isEmailVerified={ false } /> );

			// Click the "Update" button
			await user.click( screen.getByRole( 'button', { name: 'Update' } ) );

			// Quick editor should NOT be opened
			expect( mockOpen ).not.toHaveBeenCalled();

			// Verification notice should be shown instead
			expect(
				screen.getByText( 'Please verify your email address to change your profile photo.' )
			).toBeVisible();
		} );

		it( 'initializes quick editor with correct email', () => {
			render( <EditGravatar { ...defaultProps } userEmail="custom@example.com" /> );

			expect( GravatarQuickEditorCore ).toHaveBeenCalledWith(
				expect.objectContaining( {
					email: 'custom@example.com',
					scope: [ 'avatars' ],
					utm: 'wpcomme',
				} )
			);
		} );
	} );
} );
