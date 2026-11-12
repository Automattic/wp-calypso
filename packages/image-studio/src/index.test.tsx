/**
 * @vitest-environment jsdom
 */
import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { initImageStudioIntegration } from './index';

const mockAttachToEditorPost = vi.fn();
const mockSetLastSavedAttachmentId = vi.fn();
const mockAddSavedAttachmentId = vi.fn();
const mockCaptured: { onSave?: () => Promise< void > } = {};

vi.mock( '@wordpress/data', () => {
	const imageStudioSelectors = {
		getIsImageStudioOpen: () => true,
		getImageStudioAttachmentId: () => 42,
		getCanvasMetadata: () => null,
		getOriginalAttachmentId: () => 7,
		getOnCloseCallback: () => null,
		getHasUnsavedChanges: () => false,
		getLastSavedAttachmentId: () => null,
	};
	const select = () => imageStudioSelectors;
	return {
		select,
		useSelect: ( mapSelect: ( s: typeof select ) => unknown ) => mapSelect( select ),
		useDispatch: () => ( {
			openImageStudio: vi.fn(),
			closeImageStudio: vi.fn(),
			setCanvasMetadata: vi.fn(),
			setLastSavedAttachmentId: mockSetLastSavedAttachmentId,
			addSavedAttachmentId: mockAddSavedAttachmentId,
			setHasUpdatedMetadata: vi.fn(),
			addNotice: vi.fn(),
			invalidateResolution: vi.fn(),
			saveEntityRecord: vi.fn(),
		} ),
	};
} );

vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );

vi.mock( './store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { MediaLibrary: 'media_library' },
} ) );

vi.mock( './components', () => ( {
	__esModule: true,
	default: ( props: { onSave: () => Promise< void > } ) => {
		mockCaptured.onSave = props.onSave;
		return null;
	},
} ) );

vi.mock( './extensions', () => ( { registerBlockEditorFilters: vi.fn() } ) );

vi.mock( './hooks/use-draft-cleanup', () => ( {
	useDraftCleanup: () => ( { cleanupOnExit: vi.fn() } ),
} ) );

vi.mock( './hooks/use-image-file-navigation', () => ( {
	useImageFileNavigation: () => ( {
		handleNavigatePrevious: vi.fn(),
		handleNavigateNext: vi.fn(),
		hasPreviousImage: false,
		hasNextImage: false,
	} ),
} ) );

vi.mock( './hooks/use-attach-to-editor-post', () => ( {
	useAttachToEditorPost: () => mockAttachToEditorPost,
} ) );

vi.mock( './utils/get-image-data', () => ( { getImageData: vi.fn( async () => null ) } ) );

vi.mock( './utils/tracking', () => ( {
	trackImageStudioClosed: vi.fn(),
	trackImageStudioImageSaved: vi.fn(),
	trackImageStudioOpened: vi.fn(),
} ) );

describe( 'Image Studio save', () => {
	beforeAll( async () => {
		window.imageStudioData = { enabled: true };
		await act( async () => {
			initImageStudioIntegration();
		} );
	} );

	it( 'attaches the saved image before recording the save', async () => {
		await act( async () => {
			await mockCaptured.onSave?.();
		} );

		expect( mockAttachToEditorPost ).toHaveBeenCalledWith( 42, 7 );
		expect( mockAttachToEditorPost.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			mockSetLastSavedAttachmentId.mock.invocationCallOrder[ 0 ]
		);
		expect( mockSetLastSavedAttachmentId ).toHaveBeenCalledWith( 42 );
	} );

	it( 'waits for the attach to finish before recording the save', async () => {
		let finishAttach = () => {};
		mockAttachToEditorPost.mockImplementationOnce(
			() =>
				new Promise< void >( ( resolve ) => {
					finishAttach = resolve;
				} )
		);
		mockSetLastSavedAttachmentId.mockClear();

		let saving: Promise< void > | undefined;
		await act( async () => {
			saving = mockCaptured.onSave?.();
		} );
		expect( mockSetLastSavedAttachmentId ).not.toHaveBeenCalled();

		await act( async () => {
			finishAttach();
			await saving;
		} );
		expect( mockSetLastSavedAttachmentId ).toHaveBeenCalledWith( 42 );
	} );
} );
