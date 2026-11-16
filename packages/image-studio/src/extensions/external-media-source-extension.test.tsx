import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { vi } from 'vitest';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { addImageStudioMediaSource } from './external-media-source-extension';
import { handleImageSelection } from './utils';

vi.mock( '@automattic/agenttic-ui', () => ( {
	BigSkyIcon: () => null,
} ) );

vi.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

vi.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: vi.fn(),
} ) );

vi.mock( './utils', () => ( {
	handleImageSelection: vi.fn(),
} ) );

describe( 'addImageStudioMediaSource', () => {
	const getSettings = vi.fn();
	const openImageStudio = vi.fn();
	const args = {
		onSelect: vi.fn(),
		multiple: false,
		isFeatured: false,
		allowedTypes: [ 'image' ],
		onClick: vi.fn(),
	};

	beforeEach( () => {
		vi.clearAllMocks();
		getSettings.mockReturnValue( { mediaUpload: vi.fn() } );
		vi.mocked( select ).mockReturnValue( { getSettings } as ReturnType< typeof select > );
		vi.mocked( dispatch ).mockReturnValue( { openImageStudio } as ReturnType< typeof dispatch > );
	} );

	it.each( [ false, undefined ] )(
		'omits Generate Image when the mediaUpload setting is %s',
		( mediaUpload ) => {
			getSettings.mockReturnValue( { mediaUpload } );

			expect( addImageStudioMediaSource( [], args ) ).toEqual( [] );
			expect( openImageStudio ).not.toHaveBeenCalled();
		}
	);

	it( 'shows Generate Image when uploads are available', () => {
		expect( addImageStudioMediaSource( [], args ) ).toEqual( [
			expect.objectContaining( {
				id: 'big-sky-image-studio',
				label: 'Generate Image',
			} ),
		] );
		expect( select ).toHaveBeenCalledWith( blockEditorStore );
	} );

	it( 'uses the current upload permission each time the menu is rendered', () => {
		getSettings.mockReturnValue( {} );
		expect( addImageStudioMediaSource( [], args ) ).toEqual( [] );

		getSettings.mockReturnValue( { mediaUpload: vi.fn() } );
		expect( addImageStudioMediaSource( [], args ) ).toHaveLength( 1 );

		getSettings.mockReturnValue( {} );
		expect( addImageStudioMediaSource( [], args ) ).toEqual( [] );
	} );

	it.each( [
		[ false, ImageStudioEntryPoint.JetpackExternalMediaBlock ],
		[ true, ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage ],
	] )(
		'opens Image Studio with the correct entry point when isFeatured is %s',
		( isFeatured, entryPoint ) => {
			const [ source ] = addImageStudioMediaSource( [], { ...args, isFeatured } );
			source.onClick();

			expect( args.onClick ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( imageStudioStore );
			expect( openImageStudio ).toHaveBeenCalledWith(
				undefined,
				expect.any( Function ),
				entryPoint
			);

			const image = { id: 42 };
			openImageStudio.mock.calls[ 0 ][ 1 ]( image );
			expect( handleImageSelection ).toHaveBeenCalledWith( {
				image,
				onSelect: args.onSelect,
				multiple: args.multiple,
			} );
		}
	);
} );
