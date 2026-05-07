/**
 * Video Studio Store
 *
 * Dedicated wp-data store for video-mode-only state. Lives in its own
 * registered store so that older bundles — which don't know this store
 * exists — cannot win a first-write-wins registration race for it.
 */
import { createReduxStore, register, select } from '@wordpress/data';
import type { FeatureClipBrief } from '../../compositor/types';

/**
 * Phases of an in-flight feature-clip render. Surfaced to the sidebar
 * progress widget. `idle` is the resting state.
 */
export type FeatureClipProgressPhase =
	| 'idle'
	| 'analyzing'
	| 'composing'
	| 'rendering'
	| 'uploading';

/**
 * In-flight render request — produced by the client tool's executeTool
 * handler, consumed by FeatureClipRenderHost.
 */
export interface PendingFeatureClipRender {
	requestId: string;
	brief: FeatureClipBrief;
}

/**
 * Result of a completed render — produced by FeatureClipRenderHost,
 * consumed by the executeTool handler that's awaiting it.
 */
export interface FeatureClipRenderResult {
	requestId: string;
	attachmentId: number;
	url: string;
	durationSeconds: number;
}

export interface FeatureClipRenderError {
	requestId: string;
	message: string;
}

export interface VideoStudioState {
	// Selected style preset for video generation (e.g. informative, promotional,
	// informative-photo, promotional-photo).
	selectedStyle: string | null;
	// URL of the most recently generated video clip — populated when a render
	// (Veo or browser-rendered) returns a successful upload.
	currentVideoUrl: string | null;
	// Attachment ID of the most recently generated video clip.
	currentAttachmentId: number | null;
	// Duration (in seconds) of the most recently generated video clip.
	currentDurationSeconds: number | null;

	// In-flight render lifecycle (browser-rendered photo styles only).
	progressPhase: FeatureClipProgressPhase;
	pendingRender: PendingFeatureClipRender | null;
	lastRenderResult: FeatureClipRenderResult | null;
	lastRenderError: FeatureClipRenderError | null;
	isCancelling: boolean;
	// Fractional progress (0–1) of the current EditFrame render pass. Only
	// meaningful while `progressPhase === 'rendering'`. Null at all other
	// times (and reset to null when the render lifecycle ends).
	renderProgress: number | null;
}

type SetSelectedStyleAction = { type: 'SET_SELECTED_STYLE'; payload: string | null };
type SetCurrentVideoUrlAction = { type: 'SET_CURRENT_VIDEO_URL'; payload: string | null };
type SetCurrentAttachmentIdAction = {
	type: 'SET_CURRENT_ATTACHMENT_ID';
	payload: number | null;
};
type SetCurrentDurationSecondsAction = {
	type: 'SET_CURRENT_DURATION_SECONDS';
	payload: number | null;
};
type RequestFeatureClipRenderAction = {
	type: 'REQUEST_FEATURE_CLIP_RENDER';
	payload: PendingFeatureClipRender;
};
type SetProgressPhaseAction = {
	type: 'SET_FEATURE_CLIP_PROGRESS_PHASE';
	payload: FeatureClipProgressPhase;
};
type CompleteFeatureClipRenderAction = {
	type: 'COMPLETE_FEATURE_CLIP_RENDER';
	payload: FeatureClipRenderResult;
};
type FailFeatureClipRenderAction = {
	type: 'FAIL_FEATURE_CLIP_RENDER';
	payload: FeatureClipRenderError;
};
type SetIsCancellingAction = { type: 'SET_FEATURE_CLIP_IS_CANCELLING'; payload: boolean };
type ClearFeatureClipPendingAction = { type: 'CLEAR_FEATURE_CLIP_PENDING' };
type SetRenderProgressAction = {
	type: 'SET_FEATURE_CLIP_RENDER_PROGRESS';
	payload: number | null;
};

type VideoStudioAction =
	| SetSelectedStyleAction
	| SetCurrentVideoUrlAction
	| SetCurrentAttachmentIdAction
	| SetCurrentDurationSecondsAction
	| RequestFeatureClipRenderAction
	| SetProgressPhaseAction
	| CompleteFeatureClipRenderAction
	| FailFeatureClipRenderAction
	| SetIsCancellingAction
	| ClearFeatureClipPendingAction
	| SetRenderProgressAction;

const initialState: VideoStudioState = {
	selectedStyle: null,
	currentVideoUrl: null,
	currentAttachmentId: null,
	currentDurationSeconds: null,

	progressPhase: 'idle',
	pendingRender: null,
	lastRenderResult: null,
	lastRenderError: null,
	isCancelling: false,
	renderProgress: null,
};

const reducer = (
	state: VideoStudioState = initialState,
	action: VideoStudioAction
): VideoStudioState => {
	switch ( action.type ) {
		case 'SET_SELECTED_STYLE':
			return { ...state, selectedStyle: action.payload };
		case 'SET_CURRENT_VIDEO_URL':
			return { ...state, currentVideoUrl: action.payload };
		case 'SET_CURRENT_ATTACHMENT_ID':
			return { ...state, currentAttachmentId: action.payload };
		case 'SET_CURRENT_DURATION_SECONDS':
			return { ...state, currentDurationSeconds: action.payload };

		case 'REQUEST_FEATURE_CLIP_RENDER':
			return {
				...state,
				pendingRender: action.payload,
				progressPhase: 'analyzing',
				lastRenderResult: null,
				lastRenderError: null,
				isCancelling: false,
				renderProgress: null,
			};

		case 'SET_FEATURE_CLIP_PROGRESS_PHASE':
			return { ...state, progressPhase: action.payload };

		case 'COMPLETE_FEATURE_CLIP_RENDER':
			return {
				...state,
				pendingRender: null,
				progressPhase: 'idle',
				lastRenderResult: action.payload,
				currentVideoUrl: action.payload.url,
				currentAttachmentId: action.payload.attachmentId,
				currentDurationSeconds: action.payload.durationSeconds,
				renderProgress: null,
			};

		case 'FAIL_FEATURE_CLIP_RENDER':
			return {
				...state,
				pendingRender: null,
				progressPhase: 'idle',
				lastRenderError: action.payload,
				renderProgress: null,
			};

		case 'SET_FEATURE_CLIP_IS_CANCELLING':
			return { ...state, isCancelling: action.payload };

		case 'CLEAR_FEATURE_CLIP_PENDING':
			return {
				...state,
				pendingRender: null,
				progressPhase: 'idle',
				isCancelling: false,
				renderProgress: null,
			};

		case 'SET_FEATURE_CLIP_RENDER_PROGRESS':
			return { ...state, renderProgress: action.payload };

		default:
			return state;
	}
};

export interface VideoStudioActions {
	setSelectedStyle: ( style: string | null ) => Promise< SetSelectedStyleAction >;
	setCurrentVideoUrl: ( url: string | null ) => Promise< SetCurrentVideoUrlAction >;
	setCurrentAttachmentId: (
		attachmentId: number | null
	) => Promise< SetCurrentAttachmentIdAction >;
	setCurrentDurationSeconds: (
		durationSeconds: number | null
	) => Promise< SetCurrentDurationSecondsAction >;
	requestFeatureClipRender: (
		pending: PendingFeatureClipRender
	) => Promise< RequestFeatureClipRenderAction >;
	setFeatureClipProgressPhase: (
		phase: FeatureClipProgressPhase
	) => Promise< SetProgressPhaseAction >;
	completeFeatureClipRender: (
		result: FeatureClipRenderResult
	) => Promise< CompleteFeatureClipRenderAction >;
	failFeatureClipRender: (
		error: FeatureClipRenderError
	) => Promise< FailFeatureClipRenderAction >;
	setFeatureClipIsCancelling: ( isCancelling: boolean ) => Promise< SetIsCancellingAction >;
	clearFeatureClipPending: () => Promise< ClearFeatureClipPendingAction >;
	setFeatureClipRenderProgress: ( progress: number | null ) => Promise< SetRenderProgressAction >;
}

const actions = {
	setSelectedStyle( style: string | null ): SetSelectedStyleAction {
		return { type: 'SET_SELECTED_STYLE', payload: style };
	},
	setCurrentVideoUrl( url: string | null ): SetCurrentVideoUrlAction {
		return { type: 'SET_CURRENT_VIDEO_URL', payload: url };
	},
	setCurrentAttachmentId( attachmentId: number | null ): SetCurrentAttachmentIdAction {
		return { type: 'SET_CURRENT_ATTACHMENT_ID', payload: attachmentId };
	},
	setCurrentDurationSeconds( durationSeconds: number | null ): SetCurrentDurationSecondsAction {
		return { type: 'SET_CURRENT_DURATION_SECONDS', payload: durationSeconds };
	},
	requestFeatureClipRender( pending: PendingFeatureClipRender ): RequestFeatureClipRenderAction {
		return { type: 'REQUEST_FEATURE_CLIP_RENDER', payload: pending };
	},
	setFeatureClipProgressPhase( phase: FeatureClipProgressPhase ): SetProgressPhaseAction {
		return { type: 'SET_FEATURE_CLIP_PROGRESS_PHASE', payload: phase };
	},
	completeFeatureClipRender( result: FeatureClipRenderResult ): CompleteFeatureClipRenderAction {
		return { type: 'COMPLETE_FEATURE_CLIP_RENDER', payload: result };
	},
	failFeatureClipRender( error: FeatureClipRenderError ): FailFeatureClipRenderAction {
		return { type: 'FAIL_FEATURE_CLIP_RENDER', payload: error };
	},
	setFeatureClipIsCancelling( isCancelling: boolean ): SetIsCancellingAction {
		return { type: 'SET_FEATURE_CLIP_IS_CANCELLING', payload: isCancelling };
	},
	clearFeatureClipPending(): ClearFeatureClipPendingAction {
		return { type: 'CLEAR_FEATURE_CLIP_PENDING' };
	},
	setFeatureClipRenderProgress( progress: number | null ): SetRenderProgressAction {
		return { type: 'SET_FEATURE_CLIP_RENDER_PROGRESS', payload: progress };
	},
};

export interface VideoStudioSelectors {
	getSelectedStyle: ( state: VideoStudioState ) => string | null;
	getCurrentVideoUrl: ( state: VideoStudioState ) => string | null;
	getCurrentAttachmentId: ( state: VideoStudioState ) => number | null;
	getCurrentDurationSeconds: ( state: VideoStudioState ) => number | null;
	getPendingFeatureClipRender: ( state: VideoStudioState ) => PendingFeatureClipRender | null;
	getFeatureClipProgressPhase: ( state: VideoStudioState ) => FeatureClipProgressPhase;
	getLastFeatureClipRenderResult: ( state: VideoStudioState ) => FeatureClipRenderResult | null;
	getLastFeatureClipRenderError: ( state: VideoStudioState ) => FeatureClipRenderError | null;
	getFeatureClipIsCancelling: ( state: VideoStudioState ) => boolean;
	getFeatureClipRenderProgress: ( state: VideoStudioState ) => number | null;
}

const selectors = {
	getSelectedStyle( state: VideoStudioState ): string | null {
		return state.selectedStyle;
	},
	getCurrentVideoUrl( state: VideoStudioState ): string | null {
		return state.currentVideoUrl;
	},
	getCurrentAttachmentId( state: VideoStudioState ): number | null {
		return state.currentAttachmentId;
	},
	getCurrentDurationSeconds( state: VideoStudioState ): number | null {
		return state.currentDurationSeconds;
	},
	getPendingFeatureClipRender( state: VideoStudioState ): PendingFeatureClipRender | null {
		return state.pendingRender;
	},
	getFeatureClipProgressPhase( state: VideoStudioState ): FeatureClipProgressPhase {
		return state.progressPhase;
	},
	getLastFeatureClipRenderResult( state: VideoStudioState ): FeatureClipRenderResult | null {
		return state.lastRenderResult;
	},
	getLastFeatureClipRenderError( state: VideoStudioState ): FeatureClipRenderError | null {
		return state.lastRenderError;
	},
	getFeatureClipIsCancelling( state: VideoStudioState ): boolean {
		return state.isCancelling;
	},
	getFeatureClipRenderProgress( state: VideoStudioState ): number | null {
		return state.renderProgress;
	},
};

const videoStudioStore = createReduxStore( 'video-studio', {
	reducer,
	actions,
	selectors,
} );

if ( ! select( videoStudioStore ) ) {
	register( videoStudioStore );
}

export { videoStudioStore as store };
