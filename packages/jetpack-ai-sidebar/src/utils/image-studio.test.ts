/* eslint-disable @typescript-eslint/no-explicit-any */

import { dispatch } from '@wordpress/data';
import { isImageStudioAvailable, openImageStudioForBlock } from './image-studio';

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn(),
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
} ) );

const mockDispatch = dispatch as unknown as jest.Mock;

const openImageStudio = jest.fn();
const updateBlockAttributes = jest.fn();

// Routes the two stores this module dispatches to. An Image Studio bundle that
// is not loaded leaves the store registered but without openImageStudio.
function stubStores( { imageStudioRegistered = true } = {} ) {
	mockDispatch.mockImplementation( ( storeRef: string ) => {
		if ( storeRef === 'image-studio' ) {
			return imageStudioRegistered ? { openImageStudio } : {};
		}
		if ( storeRef === 'core/block-editor' ) {
			return { updateBlockAttributes };
		}
		return undefined;
	} );
}

const imageBlock = {
	clientId: 'abc123',
	name: 'core/image',
	attributes: { id: 42 },
};

describe( 'isImageStudioAvailable', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'is true when the store exposes openImageStudio', () => {
		stubStores();
		expect( isImageStudioAvailable() ).toBe( true );
	} );

	it( 'is false when the Image Studio bundle is not loaded', () => {
		stubStores( { imageStudioRegistered: false } );
		expect( isImageStudioAvailable() ).toBe( false );
	} );
} );

describe( 'openImageStudioForBlock', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		stubStores();
	} );

	it( 'passes the attachment id in edit mode', () => {
		expect( openImageStudioForBlock( imageBlock, 'edit' ) ).toBe( true );
		expect( openImageStudio ).toHaveBeenCalledWith(
			42,
			expect.any( Function ),
			'editor_sidebar',
			'core/image'
		);
	} );

	it( 'omits the attachment id in generate mode so a new image is created', () => {
		openImageStudioForBlock( imageBlock, 'generate' );
		expect( openImageStudio ).toHaveBeenCalledWith(
			undefined,
			expect.any( Function ),
			'editor_sidebar',
			'core/image'
		);
	} );

	it( 'does not open when the Image Studio bundle is not loaded', () => {
		stubStores( { imageStudioRegistered: false } );
		expect( openImageStudioForBlock( imageBlock, 'edit' ) ).toBe( false );
		expect( openImageStudio ).not.toHaveBeenCalled();
	} );

	it( 'does not open for a block without a clientId', () => {
		expect( openImageStudioForBlock( { name: 'core/image' }, 'edit' ) ).toBe( false );
		expect( openImageStudio ).not.toHaveBeenCalled();
	} );

	it( 'writes the returned image back to the block on close', () => {
		openImageStudioForBlock( imageBlock, 'edit' );
		const onClose = openImageStudio.mock.calls[ 0 ][ 1 ];

		onClose( { id: 99, url: 'https://example.com/new.jpg', alt: 'A cat' } );

		expect( updateBlockAttributes ).toHaveBeenCalledWith( 'abc123', {
			url: 'https://example.com/new.jpg',
			id: 99,
			alt: 'A cat',
		} );
	} );

	it( 'clears the block attributes when the image is removed', () => {
		openImageStudioForBlock( imageBlock, 'edit' );
		const onClose = openImageStudio.mock.calls[ 0 ][ 1 ];

		onClose( null );

		expect( updateBlockAttributes ).toHaveBeenCalledWith( 'abc123', {
			url: undefined,
			id: undefined,
			alt: '',
			title: '',
			caption: '',
		} );
	} );

	it( 'leaves the block untouched when closed without an image', () => {
		openImageStudioForBlock( imageBlock, 'edit' );
		const onClose = openImageStudio.mock.calls[ 0 ][ 1 ];

		onClose( undefined );

		expect( updateBlockAttributes ).not.toHaveBeenCalled();
	} );
} );
