/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from 'react-modal';
import { EditGravatar } from 'calypso/blocks/edit-gravatar';
import ImageEditor from 'calypso/blocks/image-editor';
import FilePicker from 'calypso/components/file-picker';
import { AspectRatios } from 'calypso/state/editor/image-editor/constants';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/components/drop-zone', () => ( { children } ) => (
	<div data-testid="dropzone">{ children }</div>
) );
jest.mock( 'calypso/blocks/image-editor', () =>
	jest.fn( ( { onDone } ) => (
		<div data-testid="image-editor">
			<button data-testid="image-editor-done" onClick={ () => onDone() }>
				Done
			</button>
		</div>
	) )
);
jest.mock( 'calypso/components/file-picker', () =>
	jest.fn( ( { onPick, children } ) => (
		<div data-testid="file-picker">
			{ children }
			<input
				data-testid="file-picker-input"
				type="file"
				onChange={ ( e ) => {
					onPick( e.target.files );
				} }
			/>
		</div>
	) )
);
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
	recordReceiveImageEvent: noop,
	resetAllImageEditorState: noop,
};

describe( 'EditGravatar', () => {
	const originalCreateObjectURL = global.URL.createObjectURL;
	const originalRevokeObjectURL = global.URL.revokeObjectURL;

	beforeAll( () => {
		global.URL.createObjectURL = noop;
		global.URL.revokeObjectURL = noop;
	} );

	afterAll( () => {
		global.URL.createObjectURL = originalCreateObjectURL;
		global.URL.revokeObjectURL = originalRevokeObjectURL;
	} );

	describe( 'component rendering', () => {
		test( 'displays a Gravatar', () => {
			render( <EditGravatar { ...props } /> );
			expect( screen.queryByAltText( props.user.display_name ) ).toBeVisible();
		} );

		test( 'contains a file picker that accepts images', () => {
			render( <EditGravatar { ...props } /> );
			expect( screen.queryByTestId( 'file-picker' ) ).toBeVisible();
			expect( FilePicker ).toHaveBeenCalledWith(
				expect.objectContaining( { accept: 'image/*' } ),
				expect.anything()
			);
		} );

		test( 'does not display the image editor by default', () => {
			render( <EditGravatar { ...props } /> );
			expect( screen.queryByTestId( 'image-editor' ) ).not.toBeInTheDocument();
		} );

		test( 'indicates when Gravatar is hidden', () => {
			render( <EditGravatar { ...props } isGravatarProfileHidden /> );
			expect( screen.queryByText( 'Your profile photo is hidden.' ) ).toBeInTheDocument();
		} );

		describe( 'drag and drop', () => {
			test( 'does not contain a drop zone for unverified users', () => {
				render( <EditGravatar { ...props } /> );
				expect( screen.queryByTestId( 'dropzone' ) ).not.toBeInTheDocument();
			} );

			test( 'contains a drop zone for verified users', () => {
				render( <EditGravatar { ...props } user={ { email_verified: true } } /> );
				expect( screen.queryByTestId( 'dropzone' ) ).toBeVisible();
			} );
		} );
	} );

	describe( 'getting a file from user', () => {
		describe( 'accepted file type', () => {
			test( 'displays the image editor with square allowed aspect ratio', async () => {
				const user = userEvent.setup();
				const { container } = render( <EditGravatar { ...props } /> );
				Modal.setAppElement( container );
				const files = [ { name: 'filename.png' } ];
				const fileInput = screen.queryByTestId( 'file-picker-input' );

				await user.upload( fileInput, files );

				expect( screen.queryByTestId( 'image-editor' ) ).toBeVisible();
				expect( ImageEditor ).toHaveBeenCalledWith(
					expect.objectContaining( { allowedAspectRatios: [ AspectRatios.ASPECT_1X1 ] } ),
					expect.anything()
				);
			} );
		} );

		describe( 'bad file type', () => {
			test( 'does not display editor, and calls error action creator', async () => {
				const user = userEvent.setup();
				const receiveGravatarImageFailedSpy = jest.fn();
				render(
					<EditGravatar { ...props } receiveGravatarImageFailed={ receiveGravatarImageFailedSpy } />
				);
				const files = [ { name: 'filename.tiff' } ];
				const fileInput = screen.queryByTestId( 'file-picker-input' );

				await user.upload( fileInput, files );

				expect( screen.queryByTestId( 'image-editor' ) ).not.toBeInTheDocument();
				expect( receiveGravatarImageFailedSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'after editing image', () => {
		const files = [ { name: 'filename.png' } ];

		test( 'given no error, hides image editor and calls upload gravatar action creator', async () => {
			const user = userEvent.setup();
			const receiveGravatarImageFailedSpy = jest.fn();
			const uploadGravatarSpy = jest.fn();
			const { container } = render(
				<EditGravatar
					{ ...props }
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					uploadGravatar={ uploadGravatarSpy }
				/>
			);
			Modal.setAppElement( container );
			const fileInput = screen.queryByTestId( 'file-picker-input' );
			await user.upload( fileInput, files );

			expect( screen.queryByTestId( 'image-editor' ) ).toBeVisible();
			await user.click( screen.getByTestId( 'image-editor-done' ) );

			expect( screen.queryByTestId( 'image-editor' ) ).not.toBeInTheDocument();
			expect( uploadGravatarSpy ).toHaveBeenCalledTimes( 1 );
			expect( receiveGravatarImageFailedSpy ).not.toHaveBeenCalled();
		} );

		test( 'given an error, hides image editor and calls error notice action creator', async () => {
			const user = userEvent.setup();
			const receiveGravatarImageFailedSpy = jest.fn();
			const uploadGravatarSpy = jest.fn();
			const { container } = render(
				<EditGravatar
					{ ...props }
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					uploadGravatar={ uploadGravatarSpy }
				/>
			);
			Modal.setAppElement( container );

			ImageEditor.mockImplementationOnce( ( { onDone } ) => (
				<div data-testid="image-editor">
					<button
						data-testid="image-editor-done"
						onClick={ () => onDone( 'some arbitrary error occured' ) }
					>
						Done
					</button>
				</div>
			) );

			const fileInput = screen.queryByTestId( 'file-picker-input' );
			await user.upload( fileInput, files );

			expect( screen.queryByTestId( 'image-editor' ) ).toBeVisible();
			await user.click( screen.getByTestId( 'image-editor-done' ) );

			expect( screen.queryByTestId( 'image-editor' ) ).not.toBeInTheDocument();
			expect( receiveGravatarImageFailedSpy ).toHaveBeenCalledTimes( 1 );
			expect( uploadGravatarSpy ).not.toHaveBeenCalled();
		} );
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
} );
