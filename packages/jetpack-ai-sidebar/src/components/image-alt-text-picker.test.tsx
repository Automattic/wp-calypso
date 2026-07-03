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

	it( 'shows each image alongside its suggested alt text', () => {
		const { container } = render( <ImageAltTextPicker images={ images } /> );
		expect( container.querySelectorAll( 'img' ) ).toHaveLength( 2 );
		expect( screen.getByText( 'A cat on a sofa' ) ).toBeInTheDocument();
		expect( screen.getByText( 'A dog in a park' ) ).toBeInTheDocument();
	} );

	it( 'has a single common Apply button (no per-image apply)', () => {
		render( <ImageAltTextPicker images={ images } /> );
		const buttons = screen.getAllByRole( 'button' );
		expect( buttons ).toHaveLength( 1 );
		expect( buttons[ 0 ] ).toHaveTextContent( 'Apply to all 2 images' );
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
		expect(
			screen.getByText( 'Updated the HTML alt text attribute for 2 images.' )
		).toBeInTheDocument();
		// The button is replaced by the confirmation, and the images stay visible.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'A cat on a sofa' ) ).toBeInTheDocument();
	} );

	it( 'calls onComplete after applying', () => {
		const onComplete = jest.fn();
		render( <ImageAltTextPicker images={ images } onComplete={ onComplete } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply to all 2 images' } ) );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses singular copy for a single image', () => {
		render( <ImageAltTextPicker images={ [ images[ 0 ] ] } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply to 1 image' } ) );
		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		expect(
			screen.getByText( 'Updated the HTML alt text attribute for 1 image.' )
		).toBeInTheDocument();
	} );

	it( 'renders nothing when there are no images', () => {
		const { container } = render( <ImageAltTextPicker images={ [] } /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
