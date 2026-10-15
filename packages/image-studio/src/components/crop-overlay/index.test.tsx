/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSetCropperState = jest.fn();
let mockCropperState: Record< string, unknown >;

jest.mock( '@wordpress/image-cropper', () => ( {
	ImageCropperProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
	ImageCropper: ( { src }: { src: string } ) => <img src={ src } alt="" />,
	useImageCropper: () => ( {
		cropperState: mockCropperState,
		setCropperState: mockSetCropperState,
	} ),
} ) );

import { CropOverlay } from './index';

describe( 'CropOverlay', () => {
	const onApply = jest.fn();
	const onCancel = jest.fn();

	const renderOverlay = ( props = {} ) =>
		render(
			<CropOverlay
				imageUrl="https://example.com/image.jpg"
				onApply={ onApply }
				onCancel={ onCancel }
				{ ...props }
			/>
		);

	beforeEach( () => {
		jest.clearAllMocks();
		mockCropperState = {
			zoom: 1,
			mediaSize: { width: 400, height: 200, naturalWidth: 800, naturalHeight: 400 },
			croppedArea: { x: 10, y: 20, width: 50, height: 40 },
		};
	} );

	it( 'applies the cropped area as a crop transform', async () => {
		const user = userEvent.setup();
		renderOverlay();

		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		expect( onApply ).toHaveBeenCalledWith( {
			type: 'crop',
			left: 10,
			top: 20,
			width: 50,
			height: 40,
		} );
	} );

	it( 'does not apply when the crop keeps the whole image', async () => {
		mockCropperState.croppedArea = { x: 0, y: 0, width: 100, height: 100 };
		const user = userEvent.setup();
		renderOverlay();

		const applyButton = screen.getByRole( 'button', { name: 'Apply' } );
		expect( applyButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( applyButton );

		expect( onApply ).not.toHaveBeenCalled();
	} );

	it( 'does not apply while disabled', async () => {
		const user = userEvent.setup();
		renderOverlay( { disabled: true } );

		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		expect( onApply ).not.toHaveBeenCalled();
	} );

	it( 'cancels from the Cancel button and the Escape key', async () => {
		const user = userEvent.setup();
		renderOverlay();

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		fireEvent.keyDown( document.body, { key: 'Escape' } );

		expect( onCancel ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'cancels on Escape before the unsaved-changes close handler sees it', () => {
		const closeHandler = jest.fn();
		document.addEventListener( 'keydown', closeHandler, true );
		renderOverlay();

		fireEvent.keyDown( document.body, { key: 'Escape' } );
		document.removeEventListener( 'keydown', closeHandler, true );

		expect( onCancel ).toHaveBeenCalledTimes( 1 );
		expect( closeHandler ).not.toHaveBeenCalled();
	} );

	it( 'sets the cropper aspect ratio from the chosen option', async () => {
		const user = userEvent.setup();
		renderOverlay();

		await user.click( screen.getByRole( 'button', { name: '16:9' } ) );
		expect( mockSetCropperState ).toHaveBeenLastCalledWith( { aspectRatio: 16 / 9 } );

		await user.click( screen.getByRole( 'button', { name: 'Original' } ) );
		expect( mockSetCropperState ).toHaveBeenLastCalledWith( { aspectRatio: 2 } );
	} );
} );
