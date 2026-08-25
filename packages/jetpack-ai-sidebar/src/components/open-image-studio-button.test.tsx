/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { isImageStudioAvailable, openImageStudioForBlock } from '../utils/image-studio';
import { trackOpenImageStudioButtonClick } from '../utils/tracking';
import OpenImageStudioButton from './open-image-studio-button';

let mockBlocksByClientId: Record< string, unknown > = {};

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		disabled,
		onClick,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		onClick: () => void;
	} ) => (
		<button type="button" disabled={ disabled } onClick={ onClick }>
			{ children }
		</button>
	),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => object ) => unknown ) =>
		callback( () => ( {
			getBlock: ( clientId: string ) => mockBlocksByClientId[ clientId ],
		} ) ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../utils/image-studio', () => ( {
	isImageStudioAvailable: jest.fn(),
	openImageStudioForBlock: jest.fn(),
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackOpenImageStudioButtonClick: jest.fn(),
} ) );

const mockIsImageStudioAvailable = isImageStudioAvailable as jest.MockedFunction<
	typeof isImageStudioAvailable
>;
const mockOpenImageStudioForBlock = openImageStudioForBlock as jest.MockedFunction<
	typeof openImageStudioForBlock
>;
const mockTrackClick = trackOpenImageStudioButtonClick as jest.MockedFunction<
	typeof trackOpenImageStudioButtonClick
>;

const imageBlock = { clientId: 'img-1', name: 'core/image', attributes: { id: 42 } };

describe( 'OpenImageStudioButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockBlocksByClientId = { 'img-1': imageBlock };
		mockIsImageStudioAvailable.mockReturnValue( true );
		mockOpenImageStudioForBlock.mockReturnValue( true );
	} );

	it( 'renders an enabled Edit image button for an image block with an attachment', () => {
		render( <OpenImageStudioButton clientId="img-1" /> );

		expect( screen.getByRole( 'button', { name: 'Edit image' } ) ).toBeEnabled();
	} );

	it( 'opens Image Studio in edit mode for the block on click', () => {
		render( <OpenImageStudioButton clientId="img-1" /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Edit image' } ) );

		expect( mockTrackClick ).toHaveBeenCalledTimes( 1 );
		expect( mockOpenImageStudioForBlock ).toHaveBeenCalledWith( imageBlock, 'edit' );
	} );

	it.each( [
		[ 'the block was removed', {} ],
		[
			'the block has no attachment',
			{ 'img-1': { clientId: 'img-1', name: 'core/image', attributes: {} } },
		],
		[
			'the block is no longer an image',
			{ 'img-1': { clientId: 'img-1', name: 'core/paragraph', attributes: { content: 'x' } } },
		],
	] )( 'disables the button when %s', ( _label, blocks ) => {
		mockBlocksByClientId = blocks;

		render( <OpenImageStudioButton clientId="img-1" /> );
		const button = screen.getByRole( 'button', { name: 'Edit image' } );

		expect( button ).toBeDisabled();
		fireEvent.click( button );
		expect( mockOpenImageStudioForBlock ).not.toHaveBeenCalled();
		expect( mockTrackClick ).not.toHaveBeenCalled();
	} );

	it( 'disables the button when Image Studio is not loaded on the page', () => {
		mockIsImageStudioAvailable.mockReturnValue( false );

		render( <OpenImageStudioButton clientId="img-1" /> );

		expect( screen.getByRole( 'button', { name: 'Edit image' } ) ).toBeDisabled();
	} );
} );
