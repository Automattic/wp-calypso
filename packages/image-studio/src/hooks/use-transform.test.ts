import { renderHook } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import { trackImageStudioError } from '../utils/tracking';
import { useTransform } from './use-transform';

let mockSelectorState: {
	isExitConfirmed: boolean;
	attachmentId: number | null;
	originalAttachmentId: number | null;
	currentImageUrl: string | null;
	originalImageUrl: string | null;
	draftIds: number[];
	canvasMetadata: Record< string, string | null > | null;
};

const mockAddNotice = jest.fn();
const mockSetDraftIds = jest.fn();
const mockAddTransformedAttachmentId = jest.fn();
const mockUpdateImageStudioCanvas = jest.fn();
const mockSetImageStudioOriginalImageUrl = jest.fn();
const mockSetImageStudioAiProcessing = jest.fn();
const mockDeleteEntityRecord = jest.fn();

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn( ( store ) =>
		store === 'core'
			? {}
			: {
					getIsExitConfirmed: () => mockSelectorState.isExitConfirmed,
					getImageStudioAttachmentId: () => mockSelectorState.attachmentId,
					getOriginalAttachmentId: () => mockSelectorState.originalAttachmentId,
					getImageStudioCurrentImageUrl: () => mockSelectorState.currentImageUrl,
					getImageStudioOriginalImageUrl: () => mockSelectorState.originalImageUrl,
					getDraftIds: () => mockSelectorState.draftIds,
					getCanvasMetadata: () => mockSelectorState.canvasMetadata,
				}
	),
	useDispatch: jest.fn( ( store ) => ( {
		deleteEntityRecord: store === 'core' ? mockDeleteEntityRecord : undefined,
		addNotice: mockAddNotice,
		setDraftIds: mockSetDraftIds,
		addTransformedAttachmentId: mockAddTransformedAttachmentId,
		updateImageStudioCanvas: mockUpdateImageStudioCanvas,
		setImageStudioOriginalImageUrl: mockSetImageStudioOriginalImageUrl,
		setImageStudioAiProcessing: mockSetImageStudioAiProcessing,
	} ) ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioError: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockTrackImageStudioError = trackImageStudioError as jest.Mock;

describe( 'useTransform', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.spyOn( window.console, 'error' ).mockImplementation( () => {} );
		mockSelectorState = {
			isExitConfirmed: false,
			attachmentId: 42,
			originalAttachmentId: 10,
			currentImageUrl: 'https://example.com/current.png',
			originalImageUrl: 'https://example.com/original.png',
			draftIds: [ 41 ],
			canvasMetadata: { title: 'Title', caption: '', description: null, alt_text: 'Alt' },
		};
	} );

	it( 'edits the current attachment on the server and shows the new draft', async () => {
		mockApiFetch.mockResolvedValue( { id: 99, source_url: 'https://example.com/edited.png' } );

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'rotate', direction: 'right' } );

		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/media/42/edit',
			method: 'POST',
			data: {
				src: 'https://example.com/current.png',
				modifiers: [ { type: 'rotate', args: { angle: 90 } } ],
				title: 'Title',
				caption: '',
				description: '',
				alt_text: 'Alt',
			},
		} );
		expect( mockSetDraftIds ).toHaveBeenCalledWith( [ 41, 99 ] );
		expect( mockAddTransformedAttachmentId ).toHaveBeenCalledWith( 99 );
		expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
			'https://example.com/edited.png',
			99,
			false
		);
		expect( mockSetImageStudioOriginalImageUrl ).toHaveBeenCalledWith(
			'https://example.com/edited.png'
		);
		expect( mockSetImageStudioAiProcessing ).toHaveBeenNthCalledWith( 1, {
			source: 'transform',
			value: true,
		} );
		expect( mockSetImageStudioAiProcessing ).toHaveBeenLastCalledWith( {
			source: 'transform',
			value: false,
		} );
		expect( mockAddNotice ).not.toHaveBeenCalled();
	} );

	it( 'falls back to the original attachment before the first edit', async () => {
		mockSelectorState.attachmentId = null;
		mockSelectorState.currentImageUrl = null;
		mockApiFetch.mockResolvedValue( { id: 99, source_url: 'https://example.com/edited.png' } );

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'flip', axis: 'horizontal' } );

		expect( mockApiFetch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/wp/v2/media/10/edit',
				data: expect.objectContaining( { src: 'https://example.com/original.png' } ),
			} )
		);
	} );

	it( 'shows an error notice, tracks the failure and keeps the canvas when the request fails', async () => {
		mockApiFetch.mockRejectedValue( { code: 'rest_image_rotation_failed' } );

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'rotate', direction: 'left' } );

		expect( mockAddNotice ).toHaveBeenCalledWith(
			'Could not edit the image. Please try again.',
			'error'
		);
		expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
			mode: 'edit',
			errorType: 'transform_failed',
			attachmentId: 42,
		} );
		expect( mockSetDraftIds ).not.toHaveBeenCalled();
		expect( mockAddTransformedAttachmentId ).not.toHaveBeenCalled();
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
		expect( mockSetImageStudioAiProcessing ).toHaveBeenLastCalledWith( {
			source: 'transform',
			value: false,
		} );
	} );

	it( 'ignores a second edit while one is in flight', async () => {
		let resolveRequest: ( value: unknown ) => void = () => {};
		mockApiFetch.mockReturnValue( new Promise( ( resolve ) => ( resolveRequest = resolve ) ) );

		const { result } = renderHook( () => useTransform() );
		const first = result.current.applyImageTransform( { type: 'rotate', direction: 'right' } );
		await result.current.applyImageTransform( { type: 'rotate', direction: 'right' } );

		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );

		resolveRequest( { id: 99, source_url: 'https://example.com/edited.png' } );
		await first;

		mockApiFetch.mockResolvedValue( { id: 100, source_url: 'https://example.com/edited-2.png' } );
		await result.current.applyImageTransform( { type: 'flip', axis: 'vertical' } );

		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'deletes the new attachment when exit starts during the request', async () => {
		mockApiFetch.mockImplementation( async () => {
			mockSelectorState.isExitConfirmed = true;
			return { id: 99, source_url: 'https://example.com/edited.png' };
		} );

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'rotate', direction: 'right' } );

		expect( mockDeleteEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'attachment',
			99,
			{ force: true },
			{ throwOnError: true }
		);
		expect( mockSetDraftIds ).not.toHaveBeenCalled();
		expect( mockAddTransformedAttachmentId ).not.toHaveBeenCalled();
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
		expect( mockAddNotice ).not.toHaveBeenCalled();
		expect( mockSetImageStudioAiProcessing ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'leaves a reopened session alone and deletes the new attachment', async () => {
		let resolveRequest: ( value: unknown ) => void = () => {};
		mockApiFetch.mockReturnValue( new Promise( ( resolve ) => ( resolveRequest = resolve ) ) );

		const { result, unmount } = renderHook( () => useTransform() );
		const pending = result.current.applyImageTransform( { type: 'rotate', direction: 'right' } );
		unmount();
		renderHook( () => useTransform() );

		resolveRequest( { id: 99, source_url: 'https://example.com/edited.png' } );
		await pending;

		expect( mockDeleteEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'attachment',
			99,
			{ force: true },
			{ throwOnError: true }
		);
		expect( mockSetDraftIds ).not.toHaveBeenCalled();
		expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();
		expect( mockSetImageStudioAiProcessing ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'explains that flipping needs a newer WordPress when core rejects the flip modifier', async () => {
		mockApiFetch.mockRejectedValue( { code: 'rest_invalid_param' } );

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'flip', axis: 'horizontal' } );

		expect( mockAddNotice ).toHaveBeenCalledWith(
			"This site's WordPress version can't flip images. Update WordPress to flip.",
			'error'
		);
	} );

	it( 'shows an error notice when there is no attachment to edit', async () => {
		mockSelectorState.attachmentId = null;
		mockSelectorState.originalAttachmentId = null;

		const { result } = renderHook( () => useTransform() );
		await result.current.applyImageTransform( { type: 'rotate', direction: 'left' } );

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( mockAddNotice ).toHaveBeenCalledWith(
			'Could not edit the image. Please try again.',
			'error'
		);
	} );
} );
