/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

let mockShouldThrow = false;

jest.mock( './index', () => ( {
	CropOverlay: () => {
		if ( mockShouldThrow ) {
			throw new Error( 'Chunk failed' );
		}
		return <div>Cropper loaded</div>;
	},
} ) );

import { LazyCropOverlay } from './lazy';

describe( 'LazyCropOverlay', () => {
	const props = {
		imageUrl: 'https://example.com/image.jpg',
		onApply: jest.fn(),
		onCancel: jest.fn(),
	};

	beforeEach( () => {
		mockShouldThrow = false;
	} );

	it( 'renders the crop overlay once it loads', async () => {
		render( <LazyCropOverlay { ...props } onLoadError={ jest.fn() } /> );

		expect( await screen.findByText( 'Cropper loaded' ) ).toBeInTheDocument();
	} );

	it( 'reports a failure instead of rendering', async () => {
		mockShouldThrow = true;
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const onLoadError = jest.fn();

		render( <LazyCropOverlay { ...props } onLoadError={ onLoadError } /> );

		await waitFor( () => expect( onLoadError ).toHaveBeenCalledTimes( 1 ) );
		expect( screen.queryByText( 'Cropper loaded' ) ).not.toBeInTheDocument();
	} );
} );
