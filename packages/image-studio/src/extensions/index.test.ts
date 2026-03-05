/**
 * Tests for extension registration system
 */

// Mock @wordpress/hooks
const mockAddFilter = jest.fn();
jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

// Mock extension modules
const mockAddImageStudioMediaSource = jest.fn();
const mockWithImageStudioGenerateButton = jest.fn();
const mockWithImageStudioToolbarButton = jest.fn();

jest.mock( './external-media-source-extension', () => ( {
	addImageStudioMediaSource: mockAddImageStudioMediaSource,
} ) );

jest.mock( './generate-button-extension', () => ( {
	withImageStudioGenerateButton: mockWithImageStudioGenerateButton,
} ) );

jest.mock( './image-toolbar-extension', () => ( {
	withImageStudioToolbarButton: mockWithImageStudioToolbarButton,
} ) );

describe( 'Extension Registration', () => {
	beforeEach( () => {
		mockAddFilter.mockClear();
		mockAddImageStudioMediaSource.mockClear();
		mockWithImageStudioGenerateButton.mockClear();
		mockWithImageStudioToolbarButton.mockClear();
		// Reset module to clear filtersRegistered flag
		jest.resetModules();
	} );

	describe( 'registerBlockEditorFilters', () => {
		it( 'should register all three filters when called', () => {
			const { registerBlockEditorFilters } = require( './index' );

			registerBlockEditorFilters();

			expect( mockAddFilter ).toHaveBeenCalledTimes( 3 );

			// Verify toolbar button filter
			expect( mockAddFilter ).toHaveBeenCalledWith(
				'editor.BlockEdit',
				'big-sky/image-studio',
				mockWithImageStudioToolbarButton
			);

			// Verify external media source filter
			expect( mockAddFilter ).toHaveBeenCalledWith(
				'jetpack.externalMedia.extraMediaSources',
				'big-sky/image-studio',
				mockAddImageStudioMediaSource
			);

			// Verify generate button filter
			expect( mockAddFilter ).toHaveBeenCalledWith(
				'editor.MediaUpload',
				'big-sky/generate-button',
				mockWithImageStudioGenerateButton
			);
		} );

		it( 'should only register filters once (idempotency)', () => {
			const { registerBlockEditorFilters } = require( './index' );

			registerBlockEditorFilters();
			registerBlockEditorFilters();
			registerBlockEditorFilters();

			// Should only call addFilter 3 times total (not 9)
			expect( mockAddFilter ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should use correct namespace for filters', () => {
			const { registerBlockEditorFilters } = require( './index' );
			registerBlockEditorFilters();

			const calls = mockAddFilter.mock.calls;

			// Check that big-sky/image-studio namespace is used for BlockEdit and externalMedia
			expect( calls[ 0 ][ 1 ] ).toBe( 'big-sky/image-studio' );
			expect( calls[ 1 ][ 1 ] ).toBe( 'big-sky/image-studio' );

			// Check that big-sky/generate-button namespace is used for MediaUpload
			expect( calls[ 2 ][ 1 ] ).toBe( 'big-sky/generate-button' );
		} );
	} );
} );
