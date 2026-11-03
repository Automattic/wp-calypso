/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import { initImageStudioIntegration } from './index';

const mockAttachToEditorPost = jest.fn();
const mockSetLastSavedAttachmentId = jest.fn();
const mockAddSavedAttachmentId = jest.fn();
const mockCaptured: { onSave?: () => Promise< void > } = {};

jest.mock( '@wordpress/data', () => {
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
			openImageStudio: jest.fn(),
			closeImageStudio: jest.fn(),
			setCanvasMetadata: jest.fn(),
			setLastSavedAttachmentId: mockSetLastSavedAttachmentId,
			addSavedAttachmentId: mockAddSavedAttachmentId,
			setHasUpdatedMetadata: jest.fn(),
			addNotice: jest.fn(),
			invalidateResolution: jest.fn(),
			saveEntityRecord: jest.fn(),
		} ),
	};
} );

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );

jest.mock( './store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { MediaLibrary: 'media_library' },
} ) );

jest.mock( './components', () => ( {
	__esModule: true,
	default: ( props: { onSave: () => Promise< void > } ) => {
		mockCaptured.onSave = props.onSave;
		return null;
	},
} ) );

jest.mock( './extensions', () => ( { registerBlockEditorFilters: jest.fn() } ) );

jest.mock( './hooks/use-draft-cleanup', () => ( {
	useDraftCleanup: () => ( { cleanupOnExit: jest.fn() } ),
} ) );

jest.mock( './hooks/use-image-file-navigation', () => ( {
	useImageFileNavigation: () => ( {
		handleNavigatePrevious: jest.fn(),
		handleNavigateNext: jest.fn(),
		hasPreviousImage: false,
		hasNextImage: false,
	} ),
} ) );

jest.mock( './hooks/use-attach-to-editor-post', () => ( {
	useAttachToEditorPost: () => mockAttachToEditorPost,
} ) );

jest.mock( './utils/get-image-data', () => ( { getImageData: jest.fn( async () => null ) } ) );

jest.mock( './utils/tracking', () => ( {
	trackImageStudioClosed: jest.fn(),
	trackImageStudioImageSaved: jest.fn(),
	trackImageStudioOpened: jest.fn(),
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
} );
