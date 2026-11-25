/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ImageEditorCanvas } from '../image-editor-canvas';

vi.mock( 'calypso/blocks/image-editor/image-editor-crop', () => ( {
	default: () => <div data-testid="image-editor-crop-mock" />,
} ) );

describe( 'ImageEditorToolbar', () => {
	test( 'should render cropping area when the image meets the minimum height and width', () => {
		render( <ImageEditorCanvas isImageLoaded showCrop /> );
		expect( screen.queryByTestId( 'image-editor-crop-mock' ) ).toBeDefined();
	} );

	test( 'should not render cropping area when the image is smaller than the minimum dimensions', () => {
		render( <ImageEditorCanvas isImageLoaded showCrop={ false } /> );
		expect( screen.queryByTestId( 'image-editor-crop-mock' ) ).toBeNull();
	} );
} );
