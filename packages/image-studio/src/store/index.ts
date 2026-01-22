/**
 * Image Studio Store
 */
import { createReduxStore, register, select } from '@wordpress/data';
import type { ImageData } from '../utils/get-image-data';

/**
 * Annotation canvas interface for imperative methods
 */
export interface AnnotationCanvasRef {
	clear: () => void;
	undo: () => void;
	redo: () => void;
	getBlob: () => Promise< Blob | null >;
	hasAnnotations: () => boolean;
	hasUndoneAnnotations: () => boolean;
}

/**
 * State interface
 */
export interface CanvasMetadata {
	title?: string | null;
	caption?: string | null;
	description?: string | null;
	alt_text?: string | null;
}

export type NoticeType = 'error' | 'success';
export interface Notice {
	id: string;
	content: string;
	type: NoticeType;
}

export enum ImageStudioEntryPoint {
	MediaLibrary = 'media_library',
	EditorBlock = 'editor_block',
	EditorSidebar = 'editor_sidebar',
	JetpackExternalMediaBlock = 'jetpack_external_media_block',
	JetpackExternalMediaFeaturedImage = 'jetpack_external_media_featured_image',
}

export interface ImageStudioState {
	isImageStudioOpen: boolean;
	imageStudioAttachmentId: number | null;
	imageStudioOriginalImageUrl: string | null;
	imageStudioCurrentImageUrl: string | null;
	imageStudioAiProcessing: boolean;
	imageStudioAiProcessingSources: Record< string, boolean >;
	// Annotation mode flag
	isAnnotationMode: boolean;
	isAnnotationSaving: boolean;
	annotatedAttachmentIds: number[];
	// Controls transition fade state when swapping images
	imageStudioTransitioning: boolean;
	// Reference to annotation canvas for imperative methods
	annotationCanvasRef: AnnotationCanvasRef | null;
	// Original attachment ID that was first loaded/generated - prevents backend from deleting it
	originalAttachmentId: number | null;
	// Array of all generated image IDs for this session (supports future undo/history)
	draftIds: number[];
	// Array of all attachment IDs that the user has explicitly saved
	savedAttachmentIds: number[];
	// Tracks whether metadata has been updated
	hasUpdatedMetadata: boolean;
	// Holds the latest metadata edits applied within the canvas
	canvasMetadata: CanvasMetadata | null;
	// The attachment ID of the most recently saved checkpoint (for tracking clean/dirty state)
	lastSavedAttachmentId: number | null;
	// Flag to bypass beforeunload warning when user has already confirmed exit via dialog
	isExitConfirmed: boolean;
	// Entry point for tracking where Image Studio was opened from
	entryPoint: ImageStudioEntryPoint | null;
	// Callback from the opener. Despite being non-serializable, it is stored here to support cross-bundle access.
	onCloseCallback: ImageStudioCloseCallback | null;
	// Array of notices to display
	notices: Notice[];
	// Persisted state for whether the Image Info sidebar should be open by default
	isSidebarOpen: boolean;
	// Selected style preset for image generation (only used in Generate mode)
	selectedStyle: string | null;
	// Selected aspect ratio preset for image generation (only used in Generate mode)
	selectedAspectRatio: string | null;
}

/**
 * Action types
 */
type OpenImageStudioAction = {
	type: 'OPEN_IMAGE_STUDIO';
	payload: {
		attachmentId: number | null;
		entryPoint: ImageStudioEntryPoint | null;
		onCloseCallback: ImageStudioCloseCallback | null;
	};
};

type CloseImageStudioAction = {
	type: 'CLOSE_IMAGE_STUDIO';
};

type UpdateImageStudioCanvasAction = {
	type: 'UPDATE_IMAGE_STUDIO_CANVAS';
	payload: {
		url: string;
		attachmentId: number | null;
		isAiProcessing: boolean;
	};
};

type SetImageStudioAiProcessingInput =
	| boolean
	| {
			source?: string;
			value: boolean;
	  };

type SetImageStudioAiProcessingAction = {
	type: 'SET_IMAGE_STUDIO_AI_PROCESSING';
	payload: {
		source?: string;
		value: boolean;
	};
};

type SetImageStudioOriginalImageUrlAction = {
	type: 'SET_IMAGE_STUDIO_ORIGINAL_IMAGE_URL';
	payload: string | null;
};

type SetAnnotationModeAction = {
	type: 'SET_ANNOTATION_MODE';
	payload: boolean;
};

type SetAnnotationCanvasRefAction = {
	type: 'SET_ANNOTATION_CANVAS_REF';
	payload: AnnotationCanvasRef | null;
};

type SetDraftIdsAction = {
	type: 'SET_DRAFT_IDS';
	payload: number[];
};

type SetHasUpdatedMetadataAction = {
	type: 'SET_HAS_UPDATED_METADATA';
	payload: boolean;
};

type SetCanvasMetadataAction = {
	type: 'SET_CANVAS_METADATA';
	payload: CanvasMetadata | null;
};

type SetIsAnnotationSavingAction = {
	type: 'SET_IS_ANNOTATION_SAVING';
	payload: boolean;
};

type AddAnnotatedAttachmentIdAction = {
	type: 'ADD_ANNOTATED_ATTACHMENT_ID';
	payload: number;
};

type SetLastSavedAttachmentIdAction = {
	type: 'SET_LAST_SAVED_ATTACHMENT_ID';
	payload: number | null;
};

type AddSavedAttachmentIdAction = {
	type: 'ADD_SAVED_ATTACHMENT_ID';
	payload: number;
};

type SetIsExitConfirmedAction = {
	type: 'SET_IS_EXIT_CONFIRMED';
	payload: boolean;
};

type AddNoticeAction = {
	type: 'ADD_NOTICE';
	payload: Notice;
};

type RemoveNoticeAction = {
	type: 'REMOVE_NOTICE';
	payload: string; // notice id
};

type SetIsSidebarOpenAction = {
	type: 'SET_IS_SIDEBAR_OPEN';
	payload: boolean;
};

type SetSelectedStyleAction = {
	type: 'SET_SELECTED_STYLE';
	payload: string | null;
};

type SetSelectedAspectRatioAction = {
	type: 'SET_SELECTED_ASPECT_RATIO';
	payload: string | null;
};

type ImageStudioCloseCallback = ( image: ImageData ) => Promise< void > | void;

type ImageStudioAction =
	| OpenImageStudioAction
	| CloseImageStudioAction
	| UpdateImageStudioCanvasAction
	| SetImageStudioAiProcessingAction
	| SetImageStudioOriginalImageUrlAction
	| SetAnnotationModeAction
	| SetAnnotationCanvasRefAction
	| SetDraftIdsAction
	| SetHasUpdatedMetadataAction
	| SetIsAnnotationSavingAction
	| AddAnnotatedAttachmentIdAction
	| SetCanvasMetadataAction
	| SetLastSavedAttachmentIdAction
	| AddSavedAttachmentIdAction
	| SetIsExitConfirmedAction
	| AddNoticeAction
	| RemoveNoticeAction
	| SetIsSidebarOpenAction
	| SetSelectedStyleAction
	| SetSelectedAspectRatioAction;

/**
 * Key for localStorage persistence
 */
const SIDEBAR_IS_OPEN_STORAGE_KEY = 'big-sky-image-studio-sidebar-open';

/**
 * Get persisted sidebar state from localStorage
 */
const getSidebarIsOpenStateFromLocalStorage = (): boolean => {
	try {
		const stored = localStorage.getItem( SIDEBAR_IS_OPEN_STORAGE_KEY );
		return stored === 'true';
	} catch {
		return false;
	}
};

/**
 * Initial state for the image studio store
 */
const initialState: ImageStudioState = {
	isImageStudioOpen: false,
	imageStudioAttachmentId: null,
	imageStudioOriginalImageUrl: null,
	imageStudioCurrentImageUrl: null,
	imageStudioAiProcessing: false,
	isAnnotationMode: false,
	imageStudioTransitioning: false,
	annotationCanvasRef: null,
	isAnnotationSaving: false,
	annotatedAttachmentIds: [],
	imageStudioAiProcessingSources: {},
	originalAttachmentId: null,
	draftIds: [],
	savedAttachmentIds: [],
	hasUpdatedMetadata: false,
	canvasMetadata: null,
	lastSavedAttachmentId: null,
	isExitConfirmed: false,
	entryPoint: null,
	onCloseCallback: null,
	notices: [],
	isSidebarOpen: getSidebarIsOpenStateFromLocalStorage(),
	selectedStyle: null,
	selectedAspectRatio: null,
};

/**
 * Reducer
 *
 * @param state  - Current state
 * @param action - Action to handle
 * @return New state
 */
const reducer = (
	state: ImageStudioState = initialState,
	action: ImageStudioAction
): ImageStudioState => {
	switch ( action.type ) {
		case 'OPEN_IMAGE_STUDIO':
			return {
				...initialState,
				isImageStudioOpen: true,
				imageStudioAttachmentId: action.payload.attachmentId,
				annotatedAttachmentIds: [],
				imageStudioAiProcessingSources: {},
				// Set originalAttachmentId to the attachmentId if opening with existing image, null if generating from scratch
				originalAttachmentId: action.payload.attachmentId,
				// Reset draftIds for new session
				draftIds: [],
				// Reset savedAttachmentIds for new session
				savedAttachmentIds: [],
				// Reset lastSavedAttachmentId for new session (only set when user explicitly saves)
				lastSavedAttachmentId: null,
				// Store entry point for tracking
				entryPoint: action.payload.entryPoint,
				onCloseCallback: action.payload.onCloseCallback ?? null,
				// Reset notices for new session
				notices: [],
				// Re-read sidebar state from localStorage on each open
				isSidebarOpen: getSidebarIsOpenStateFromLocalStorage(),
			};

		case 'CLOSE_IMAGE_STUDIO':
			return {
				...initialState,
				annotatedAttachmentIds: [],
				imageStudioAiProcessingSources: {},
				draftIds: [],
				savedAttachmentIds: [],
			};

		case 'UPDATE_IMAGE_STUDIO_CANVAS': {
			if ( typeof action.payload.isAiProcessing !== 'boolean' ) {
				return {
					...state,
					imageStudioCurrentImageUrl: action.payload.url,
					imageStudioAttachmentId: action.payload.attachmentId,
				};
			}

			const source = 'default';
			const value = action.payload.isAiProcessing;
			const next = { ...state.imageStudioAiProcessingSources };
			if ( value ) {
				next[ source ] = true;
			} else {
				delete next[ source ];
			}

			return {
				...state,
				imageStudioCurrentImageUrl: action.payload.url,
				imageStudioAttachmentId: action.payload.attachmentId,
				imageStudioAiProcessingSources: next,
				imageStudioAiProcessing: Object.values( next ).some( Boolean ),
			};
		}

		case 'SET_IMAGE_STUDIO_AI_PROCESSING': {
			const { source = 'default', value } = action.payload;
			const next = { ...state.imageStudioAiProcessingSources };
			if ( value ) {
				next[ source ] = true;
			} else {
				delete next[ source ];
			}

			return {
				...state,
				imageStudioAiProcessingSources: next,
				imageStudioAiProcessing: Object.values( next ).some( Boolean ),
			};
		}

		case 'SET_IMAGE_STUDIO_ORIGINAL_IMAGE_URL':
			return {
				...state,
				imageStudioOriginalImageUrl: action.payload,
			};

		case 'SET_ANNOTATION_MODE':
			return {
				...state,
				isAnnotationMode: action.payload,
			};

		case 'SET_ANNOTATION_CANVAS_REF':
			return {
				...state,
				annotationCanvasRef: action.payload,
			};

		case 'SET_DRAFT_IDS':
			return {
				...state,
				draftIds: action.payload,
			};

		case 'SET_HAS_UPDATED_METADATA':
			return {
				...state,
				hasUpdatedMetadata: action.payload,
			};

		case 'SET_CANVAS_METADATA':
			return {
				...state,
				canvasMetadata: action.payload,
			};

		case 'SET_IS_ANNOTATION_SAVING':
			return {
				...state,
				isAnnotationSaving: action.payload,
			};

		case 'ADD_ANNOTATED_ATTACHMENT_ID':
			return {
				...state,
				annotatedAttachmentIds: [ ...state.annotatedAttachmentIds, action.payload ],
			};

		case 'SET_LAST_SAVED_ATTACHMENT_ID':
			return {
				...state,
				lastSavedAttachmentId: action.payload,
			};

		case 'ADD_SAVED_ATTACHMENT_ID': {
			// Use Set to prevent duplicates
			const updatedSavedIds = new Set< number >( state.savedAttachmentIds );
			updatedSavedIds.add( action.payload );

			// Remove from draftIds since it's now saved
			const updatedDraftIds = state.draftIds.filter( ( id ) => id !== action.payload );

			return {
				...state,
				savedAttachmentIds: [ ...updatedSavedIds ],
				draftIds: updatedDraftIds,
			};
		}

		case 'SET_IS_EXIT_CONFIRMED':
			return {
				...state,
				isExitConfirmed: action.payload,
			};

		case 'ADD_NOTICE':
			return {
				...state,
				notices: [ ...state.notices, action.payload ],
			};

		case 'REMOVE_NOTICE':
			return {
				...state,
				notices: state.notices.filter( ( notice ) => notice.id !== action.payload ),
			};

		case 'SET_IS_SIDEBAR_OPEN':
			// Persist to localStorage
			try {
				localStorage.setItem( SIDEBAR_IS_OPEN_STORAGE_KEY, String( action.payload ) );
			} catch {
				// Ignore localStorage errors
			}
			return {
				...state,
				isSidebarOpen: action.payload,
			};

		case 'SET_SELECTED_STYLE':
			return {
				...state,
				selectedStyle: action.payload,
			};

		case 'SET_SELECTED_ASPECT_RATIO':
			return {
				...state,
				selectedAspectRatio: action.payload,
			};

		default:
			return state;
	}
};

/**
 * Actions interface (promisified - for external use with useDispatch)
 * WordPress wraps all action creators to return promises when dispatched
 */
export interface ImageStudioActions {
	openImageStudio: (
		attachmentId?: number,
		onCloseCallback?: ImageStudioCloseCallback,
		entryPoint?: ImageStudioEntryPoint
	) => Promise< OpenImageStudioAction >;
	closeImageStudio: () => Promise< CloseImageStudioAction >;
	updateImageStudioCanvas: (
		url: string,
		attachmentId: number | null,
		isAiProcessing?: boolean
	) => Promise< UpdateImageStudioCanvasAction >;
	setImageStudioAiProcessing: (
		isProcessing: SetImageStudioAiProcessingInput
	) => Promise< SetImageStudioAiProcessingAction >;
	setImageStudioOriginalImageUrl: (
		url: string | null
	) => Promise< SetImageStudioOriginalImageUrlAction >;
	setAnnotationMode: ( enabled: boolean ) => Promise< SetAnnotationModeAction >;
	setAnnotationCanvasRef: (
		ref: AnnotationCanvasRef | null
	) => Promise< SetAnnotationCanvasRefAction >;
	setDraftIds: ( draftIds: number[] ) => Promise< SetDraftIdsAction >;
	setHasUpdatedMetadata: ( hasUpdated: boolean ) => Promise< SetHasUpdatedMetadataAction >;
	setIsAnnotationSaving: ( isSaving: boolean ) => Promise< SetIsAnnotationSavingAction >;
	addAnnotatedAttachmentId: ( attachmentId: number ) => Promise< AddAnnotatedAttachmentIdAction >;
	setCanvasMetadata: ( ( metadata: CanvasMetadata | null ) => Promise< SetCanvasMetadataAction > ) &
		( ( metadata: CanvasMetadata | null ) => Promise< SetCanvasMetadataAction > );
	setLastSavedAttachmentId: (
		attachmentId: number | null
	) => Promise< SetLastSavedAttachmentIdAction >;
	addSavedAttachmentId: ( attachmentId: number ) => Promise< AddSavedAttachmentIdAction >;
	setIsExitConfirmed: ( value: boolean ) => Promise< SetIsExitConfirmedAction >;
	addNotice: ( content: string, type: 'error' | 'success' ) => Promise< AddNoticeAction >;
	removeNotice: ( noticeId: string ) => Promise< RemoveNoticeAction >;
	setIsSidebarOpen: ( isOpen: boolean ) => Promise< SetIsSidebarOpenAction >;
	setSelectedStyle: ( style: string | null ) => Promise< SetSelectedStyleAction >;
	setSelectedAspectRatio: ( aspectRatio: string | null ) => Promise< SetSelectedAspectRatioAction >;
}

/**
 * Actions
 */
const actions = {
	openImageStudio(
		attachmentId?: number,
		onCloseCallback?: ImageStudioCloseCallback,
		entryPoint?: ImageStudioEntryPoint
	): OpenImageStudioAction {
		return {
			type: 'OPEN_IMAGE_STUDIO',
			payload: {
				attachmentId: attachmentId ?? null,
				entryPoint: entryPoint ?? null,
				onCloseCallback: onCloseCallback ?? null,
			},
		};
	},

	closeImageStudio(): CloseImageStudioAction {
		return {
			type: 'CLOSE_IMAGE_STUDIO',
		};
	},

	updateImageStudioCanvas(
		url: string,
		attachmentId: number | null,
		isAiProcessing = false
	): UpdateImageStudioCanvasAction {
		return {
			type: 'UPDATE_IMAGE_STUDIO_CANVAS',
			payload: { url, attachmentId, isAiProcessing },
		};
	},

	setImageStudioAiProcessing(
		isProcessing: SetImageStudioAiProcessingInput
	): SetImageStudioAiProcessingAction {
		const normalizedPayload =
			typeof isProcessing === 'object'
				? {
						source: isProcessing.source || 'default',
						value: isProcessing.value,
				  }
				: { source: 'default', value: isProcessing };
		return {
			type: 'SET_IMAGE_STUDIO_AI_PROCESSING',
			payload: normalizedPayload,
		};
	},

	setImageStudioOriginalImageUrl( url: string | null ): SetImageStudioOriginalImageUrlAction {
		return {
			type: 'SET_IMAGE_STUDIO_ORIGINAL_IMAGE_URL',
			payload: url,
		};
	},

	setAnnotationMode( enabled: boolean ): SetAnnotationModeAction {
		return {
			type: 'SET_ANNOTATION_MODE',
			payload: enabled,
		};
	},

	setAnnotationCanvasRef( ref: AnnotationCanvasRef | null ): SetAnnotationCanvasRefAction {
		return {
			type: 'SET_ANNOTATION_CANVAS_REF',
			payload: ref,
		};
	},

	setDraftIds( draftIds: number[] ): SetDraftIdsAction {
		return {
			type: 'SET_DRAFT_IDS',
			payload: draftIds,
		};
	},

	setIsAnnotationSaving( isSaving: boolean ): SetIsAnnotationSavingAction {
		return {
			type: 'SET_IS_ANNOTATION_SAVING',
			payload: isSaving,
		};
	},

	addAnnotatedAttachmentId( attachmentId: number ): AddAnnotatedAttachmentIdAction {
		return {
			type: 'ADD_ANNOTATED_ATTACHMENT_ID',
			payload: attachmentId,
		};
	},

	setHasUpdatedMetadata( hasUpdated: boolean ): SetHasUpdatedMetadataAction {
		return {
			type: 'SET_HAS_UPDATED_METADATA',
			payload: hasUpdated,
		};
	},

	setCanvasMetadata( metadata: CanvasMetadata | null ): SetCanvasMetadataAction {
		return {
			type: 'SET_CANVAS_METADATA',
			payload: metadata,
		};
	},

	setLastSavedAttachmentId( attachmentId: number | null ): SetLastSavedAttachmentIdAction {
		return {
			type: 'SET_LAST_SAVED_ATTACHMENT_ID',
			payload: attachmentId,
		};
	},

	addSavedAttachmentId( attachmentId: number ): AddSavedAttachmentIdAction {
		return {
			type: 'ADD_SAVED_ATTACHMENT_ID',
			payload: attachmentId,
		};
	},

	setIsExitConfirmed( value: boolean ): SetIsExitConfirmedAction {
		return {
			type: 'SET_IS_EXIT_CONFIRMED',
			payload: value,
		};
	},

	addNotice( content: string, type: NoticeType ): AddNoticeAction {
		return {
			type: 'ADD_NOTICE',
			payload: {
				// eslint-disable-next-line no-restricted-syntax -- The id is only for UI purposes
				id: `${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
				content,
				type,
			},
		};
	},

	removeNotice( noticeId: string ): RemoveNoticeAction {
		return {
			type: 'REMOVE_NOTICE',
			payload: noticeId,
		};
	},

	setIsSidebarOpen( isOpen: boolean ): SetIsSidebarOpenAction {
		return {
			type: 'SET_IS_SIDEBAR_OPEN',
			payload: isOpen,
		};
	},

	setSelectedStyle( style: string | null ): SetSelectedStyleAction {
		return {
			type: 'SET_SELECTED_STYLE',
			payload: style,
		};
	},

	setSelectedAspectRatio( aspectRatio: string | null ): SetSelectedAspectRatioAction {
		return {
			type: 'SET_SELECTED_ASPECT_RATIO',
			payload: aspectRatio,
		};
	},
};

/**
 * Selectors interface
 */
export interface ImageStudioSelectors {
	getIsImageStudioOpen: ( state: ImageStudioState ) => boolean;
	getImageStudioAttachmentId: ( state: ImageStudioState ) => number | null;
	getImageStudioOriginalImageUrl: ( state: ImageStudioState ) => string | null;
	getImageStudioCurrentImageUrl: ( state: ImageStudioState ) => string | null;
	getImageStudioAiProcessing: ( state: ImageStudioState ) => boolean;
	getIsAnnotationMode: ( state: ImageStudioState ) => boolean;
	getImageStudioTransitioning: ( state: ImageStudioState ) => boolean;
	getAnnotationCanvasRef: ( state: ImageStudioState ) => AnnotationCanvasRef | null;
	getOriginalAttachmentId: ( state: ImageStudioState ) => number | null;
	getDraftIds: ( state: ImageStudioState ) => number[];
	getHasUpdatedMetadata: ( state: ImageStudioState ) => boolean;
	getCanvasMetadata: ( state: ImageStudioState ) => CanvasMetadata | null;
	getIsAnnotationSaving: ( state: ImageStudioState ) => boolean;
	getAnnotatedAttachmentIds: ( state: ImageStudioState ) => number[];
	getLastSavedAttachmentId: ( state: ImageStudioState ) => number | null;
	getSavedAttachmentIds: ( state: ImageStudioState ) => number[];
	getHasUnsavedChanges: ( state: ImageStudioState ) => boolean;
	getIsExitConfirmed: ( state: ImageStudioState ) => boolean;
	getEntryPoint: ( state: ImageStudioState ) => ImageStudioEntryPoint | null;
	getNotices: ( state: ImageStudioState ) => Notice[];
	getOnCloseCallback: ( state: ImageStudioState ) => ImageStudioCloseCallback | null;
	getIsSidebarOpen: ( state: ImageStudioState ) => boolean;
	getSelectedStyle: ( state: ImageStudioState ) => string | null;
	getSelectedAspectRatio: ( state: ImageStudioState ) => string | null;
}

/**
 * Selectors
 */
const selectors = {
	getIsImageStudioOpen( state: ImageStudioState ): boolean {
		return state.isImageStudioOpen;
	},

	getImageStudioAttachmentId( state: ImageStudioState ): number | null {
		return state.imageStudioAttachmentId;
	},

	getImageStudioOriginalImageUrl( state: ImageStudioState ): string | null {
		return state.imageStudioOriginalImageUrl;
	},

	getImageStudioCurrentImageUrl( state: ImageStudioState ): string | null {
		return state.imageStudioCurrentImageUrl;
	},

	getImageStudioAiProcessing( state: ImageStudioState ): boolean {
		return state.imageStudioAiProcessing;
	},

	getIsAnnotationMode( state: ImageStudioState ): boolean {
		return state.isAnnotationMode;
	},

	getImageStudioTransitioning( state: ImageStudioState ): boolean {
		return state.imageStudioTransitioning;
	},

	getAnnotationCanvasRef( state: ImageStudioState ): AnnotationCanvasRef | null {
		return state.annotationCanvasRef;
	},

	getOriginalAttachmentId( state: ImageStudioState ): number | null {
		return state.originalAttachmentId;
	},

	getDraftIds( state: ImageStudioState ): number[] {
		return state.draftIds;
	},

	getHasUpdatedMetadata( state: ImageStudioState ): boolean {
		return state.hasUpdatedMetadata;
	},

	getCanvasMetadata( state: ImageStudioState ): CanvasMetadata | null {
		return state.canvasMetadata;
	},

	getIsAnnotationSaving( state: ImageStudioState ): boolean {
		return state.isAnnotationSaving;
	},

	getAnnotatedAttachmentIds( state: ImageStudioState ): number[] {
		return state.annotatedAttachmentIds;
	},

	getLastSavedAttachmentId( state: ImageStudioState ): number | null {
		return state.lastSavedAttachmentId;
	},

	getSavedAttachmentIds( state: ImageStudioState ): number[] {
		return state.savedAttachmentIds;
	},

	getHasUnsavedChanges( state: ImageStudioState ): boolean {
		// If metadata has been updated, we have unsaved changes
		if ( state.hasUpdatedMetadata ) {
			return true;
		}

		// If we haven't generated any image yet, there are no unsaved changes
		if ( state.imageStudioAttachmentId === null ) {
			return false;
		}

		// If user hasn't explicitly saved yet (no checkpoint)
		if ( state.lastSavedAttachmentId === null ) {
			// When editing existing image: compare current with original
			if ( state.originalAttachmentId !== null ) {
				return state.imageStudioAttachmentId !== state.originalAttachmentId;
			}
			// When generating from scratch: any generated image is unsaved
			return true;
		}

		// User has saved at least once: compare current with last checkpoint
		return state.imageStudioAttachmentId !== state.lastSavedAttachmentId;
	},

	getIsExitConfirmed( state: ImageStudioState ): boolean {
		return state.isExitConfirmed;
	},

	getEntryPoint( state: ImageStudioState ): ImageStudioEntryPoint | null {
		return state.entryPoint;
	},

	getOnCloseCallback( state: ImageStudioState ): ImageStudioCloseCallback | null {
		return state.onCloseCallback;
	},

	getNotices( state: ImageStudioState ): Notice[] {
		return state.notices;
	},

	getIsSidebarOpen( state: ImageStudioState ): boolean {
		return state.isSidebarOpen;
	},

	getSelectedStyle( state: ImageStudioState ): string | null {
		return state.selectedStyle;
	},

	getSelectedAspectRatio( state: ImageStudioState ): string | null {
		return state.selectedAspectRatio;
	},
};

/**
 * Create the image-studio store
 * This is the dedicated store for all image-studio state.
 */
const imageStudioStore = createReduxStore( 'image-studio', {
	reducer,
	actions,
	selectors,
} );

// Only register if not already registered
// This prevents "Store already registered" errors when both bundles load
if ( ! select( imageStudioStore ) ) {
	register( imageStudioStore );
}

export { imageStudioStore as store };
