/**
 * @jest-environment jsdom
 */
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditGravatar } from 'calypso/blocks/edit-gravatar';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@gravatar-com/quick-editor', () => ( {
	GravatarQuickEditorCore: jest.fn().mockImplementation( function () {
		this.open = jest.fn();
	} ),
} ) );

jest.mock( 'calypso/state/selectors/get-user-settings', () => jest.fn( () => {} ) );

const render = ( el, options ) => renderWithProvider( el, { ...options } );

const noop = () => {};

const props = {
	translate: ( i ) => i,
	user: {
		email_verified: false,
		display_name: 'arbitrary-user-display-name',
	},
	recordClickButtonEvent: noop,
};

describe( 'EditGravatar', () => {
	describe( 'component rendering', () => {
		test( 'displays a Gravatar', () => {
			render( <EditGravatar { ...props } /> );
			expect( screen.queryByAltText( props.user.display_name ) ).toBeVisible();
		} );
	} );

	test( 'indicates when Gravatar is hidden', () => {
		render( <EditGravatar { ...props } isGravatarProfileHidden /> );
		expect( screen.queryByText( 'Your profile photo is hidden.' ) ).toBeInTheDocument();
	} );

	describe( 'unverified user', () => {
		test( 'shows email verification dialog when clicked', async () => {
			const user = userEvent.setup();
			render( <EditGravatar { ...props } /> );

			// The button now has an aria-label set based on verification status.
			const button = screen.getByRole( 'button', {
				name: /verify your email to change profile photo/i,
			} );

			await user.click( button );

			// Check for dialog modal copy to ensure it appeared.
			expect(
				screen.queryByText( /Secure your account and access more features./ )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Change avatar', () => {
		test( 'Clicking the button opens the Gravatar Quick Editor', async () => {
			const user = userEvent.setup();
			render(
				<EditGravatar
					{ ...props }
					user={ {
						email_verified: true,
						display_name: 'arbitrary-user-display-name',
					} }
				/>
			);

			// The button now has an aria-label set based on verification status.
			const button = screen.getByRole( 'button', {
				name: /Change profile photo/i,
			} );

			await user.click( button );

			expect( GravatarQuickEditorCore ).toHaveBeenCalled();
			expect( GravatarQuickEditorCore.mock.instances[ 0 ].open ).toHaveBeenCalled();
		} );
	} );
} );
