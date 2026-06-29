/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ImageAltTextPicker from './image-alt-text-picker';

const mockUpdateBlockAttributes = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: ( store: string ) => {
		if ( store === 'core/block-editor' ) {
			return { updateBlockAttributes: mockUpdateBlockAttributes };
		}
		return {};
	},
} ) );

describe( 'ImageAltTextPicker', () => {
	beforeEach( () => {
		mockUpdateBlockAttributes.mockClear();
	} );

	const images = [
		{
			clientId: 'block-a',
			url: 'https://example.test/a.jpg',
			currentAlt: '',
			alt: 'A cat on a sofa',
		},
		{
			clientId: 'block-b',
			url: 'https://example.test/b.jpg',
			currentAlt: 'old',
			alt: 'A dog in a park',
		},
	];

	it( 'does not surface the generated alt text or thumbnails for review', () => {
		const { container } = render( <ImageAltTextPicker images={ images } /> );
		expect( container.querySelectorAll( 'img' ) ).toHaveLength( 0 );
		expect( screen.queryByText( 'A cat on a sofa' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Generated alt text for 2 images.' ) ).toBeInTheDocument();
	} );

	it( 'applies alt text to every image in one click and confirms', () => {
		render( <ImageAltTextPicker images={ images } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply to all 2 images' } ) );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 2 );
		expect( mockUpdateBlockAttributes ).toHaveBeenCalledWith( 'block-a', {
			alt: 'A cat on a sofa',
		} );
		expect( mockUpdateBlockAttributes ).toHaveBeenCalledWith( 'block-b', {
			alt: 'A dog in a park',
		} );
		expect( screen.getByText( 'Updated alt text for 2 images.' ) ).toBeInTheDocument();
		// The apply control is gone once applied.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'calls onComplete after applying', () => {
		const onComplete = jest.fn();
		render( <ImageAltTextPicker images={ images } onComplete={ onComplete } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply to all 2 images' } ) );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses singular copy for a single image', () => {
		render( <ImageAltTextPicker images={ [ images[ 0 ] ] } /> );
		expect( screen.getByText( 'Generated alt text for 1 image.' ) ).toBeInTheDocument();
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply to 1 image' } ) );
		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Updated alt text for 1 image.' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing when there are no images', () => {
		const { container } = render( <ImageAltTextPicker images={ [] } /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
