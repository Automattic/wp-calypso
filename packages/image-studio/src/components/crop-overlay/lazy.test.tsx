/* eslint-disable import/order */
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

let mockShouldThrow = false;

vi.mock( './index', () => ( {
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
		onApply: vi.fn(),
		onCancel: vi.fn(),
	};

	beforeEach( () => {
		mockShouldThrow = false;
	} );

	it( 'renders the crop overlay once it loads', async () => {
		render( <LazyCropOverlay { ...props } onLoadError={ vi.fn() } /> );

		expect( await screen.findByText( 'Cropper loaded' ) ).toBeInTheDocument();
	} );

	it( 'reports a failure instead of rendering', async () => {
		mockShouldThrow = true;
		vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		const onLoadError = vi.fn();

		render( <LazyCropOverlay { ...props } onLoadError={ onLoadError } /> );

		await waitFor( () => expect( onLoadError ).toHaveBeenCalledTimes( 1 ) );
		expect( screen.queryByText( 'Cropper loaded' ) ).not.toBeInTheDocument();
	} );
} );
