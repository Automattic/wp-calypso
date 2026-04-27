/**
 * Video Studio Store
 *
 * Dedicated wp-data store for video-mode-only state. Lives in its own
 * registered store so that older bundles — which don't know this store
 * exists — cannot win a first-write-wins registration race for it.
 */
import { createReduxStore, register, select } from '@wordpress/data';

/**
 * State interface
 */
export interface VideoStudioState {
	// Selected style preset for video generation (e.g. informative, promotional).
	selectedStyle: string | null;
	// URL of the most recently generated video clip — populated when the
	// wpcom/generate-video-for-studio tool returns a successful upload.
	currentVideoUrl: string | null;
}

/**
 * Action types
 */
type SetSelectedStyleAction = {
	type: 'SET_SELECTED_STYLE';
	payload: string | null;
};

type SetCurrentVideoUrlAction = {
	type: 'SET_CURRENT_VIDEO_URL';
	payload: string | null;
};

type VideoStudioAction = SetSelectedStyleAction | SetCurrentVideoUrlAction;

/**
 * Initial state for the video studio store
 */
const initialState: VideoStudioState = {
	selectedStyle: null,
	currentVideoUrl: null,
};

/**
 * Reducer
 * @param state  - Current state
 * @param action - Action to handle
 * @returns New state
 */
const reducer = (
	state: VideoStudioState = initialState,
	action: VideoStudioAction
): VideoStudioState => {
	switch ( action.type ) {
		case 'SET_SELECTED_STYLE':
			return {
				...state,
				selectedStyle: action.payload,
			};

		case 'SET_CURRENT_VIDEO_URL':
			return {
				...state,
				currentVideoUrl: action.payload,
			};

		default:
			return state;
	}
};

/**
 * Actions interface (promisified - for external use with useDispatch)
 * WordPress wraps all action creators to return promises when dispatched
 */
export interface VideoStudioActions {
	setSelectedStyle: ( style: string | null ) => Promise< SetSelectedStyleAction >;
	setCurrentVideoUrl: ( url: string | null ) => Promise< SetCurrentVideoUrlAction >;
}

/**
 * Actions
 */
const actions = {
	setSelectedStyle( style: string | null ): SetSelectedStyleAction {
		return {
			type: 'SET_SELECTED_STYLE',
			payload: style,
		};
	},

	setCurrentVideoUrl( url: string | null ): SetCurrentVideoUrlAction {
		return {
			type: 'SET_CURRENT_VIDEO_URL',
			payload: url,
		};
	},
};

/**
 * Selectors interface
 */
export interface VideoStudioSelectors {
	getSelectedStyle: ( state: VideoStudioState ) => string | null;
	getCurrentVideoUrl: ( state: VideoStudioState ) => string | null;
}

/**
 * Selectors
 */
const selectors = {
	getSelectedStyle( state: VideoStudioState ): string | null {
		return state.selectedStyle;
	},

	getCurrentVideoUrl( state: VideoStudioState ): string | null {
		return state.currentVideoUrl;
	},
};

/**
 * Create the video-studio store
 *
 * This store is brand-new — older bundles never registered a store with this
 * name, so there is no first-write-wins collision with stale state shapes.
 */
const videoStudioStore = createReduxStore( 'video-studio', {
	reducer,
	actions,
	selectors,
} );

// Only register if not already registered
// This prevents "Store already registered" errors when both bundles load
if ( ! select( videoStudioStore ) ) {
	register( videoStudioStore );
}

export { videoStudioStore as store };
