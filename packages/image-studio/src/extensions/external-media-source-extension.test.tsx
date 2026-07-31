/**
 * @jest-environment jsdom
 */
import { dispatch } from '@wordpress/data';
import { trackImageStudioOpened } from '../utils/tracking';
import { addImageStudioMediaSource } from './external-media-source-extension';

// Webpack global injected at build time, used at render time by __().
( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

jest.mock( '@automattic/agenttic-ui', () => ( {
	BigSkyIcon: () => null,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Edit: 'edit' },
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: jest.fn(),
} ) );

const mockOpenImageStudio = jest.fn();

function openMediaSource( { isFeatured = false } = {} ) {
	( dispatch as unknown as jest.Mock ).mockReturnValue( {
		openImageStudio: mockOpenImageStudio,
	} );

	const [ source ] = addImageStudioMediaSource( [], {
		onSelect: jest.fn(),
		multiple: false,
		isFeatured,
		allowedTypes: [ 'image' ],
		onClick: jest.fn(),
	} );

	source.onClick();
}

describe( 'addImageStudioMediaSource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Image Studio before tracking, so the event carries the new session', () => {
		openMediaSource();

		expect( mockOpenImageStudio ).toHaveBeenCalled();
		expect( trackImageStudioOpened ).toHaveBeenCalled();
		expect( mockOpenImageStudio.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			( trackImageStudioOpened as jest.Mock ).mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'tracks the featured image entry point', () => {
		openMediaSource( { isFeatured: true } );

		expect( trackImageStudioOpened ).toHaveBeenCalledWith( {
			mode: 'edit',
			attachmentId: undefined,
			entryPoint: 'jetpack_external_media_featured_image',
		} );
	} );
} );
