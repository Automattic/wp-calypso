/**
 * AI Block Notes Store
 *
 * Minimal @wordpress/data store for AI Block Notes state.
 * Tracks which notes are being processed by the AI and provides a stable session ID.
 */
import { createReduxStore, register, select } from '@wordpress/data';

/**
 * State interface
 */
export interface AiBlockNotesState {
	inProcessNotesByPost: Record< number, number[] >; // postId → noteId[]
	sessionId: string;
}

/**
 * Action types
 */
type AddInProcessBlockNoteAction = {
	type: 'ADD_IN_PROCESS_BLOCK_NOTE';
	payload: {
		noteId: number;
		postId: number;
	};
};

type RemoveInProcessBlockNoteAction = {
	type: 'REMOVE_IN_PROCESS_BLOCK_NOTE';
	payload: {
		noteId: number;
		postId: number;
	};
};

type AiBlockNotesAction = AddInProcessBlockNoteAction | RemoveInProcessBlockNoteAction;

/**
 * Initial state
 */
const initialState: AiBlockNotesState = {
	inProcessNotesByPost: {},
	sessionId: Math.random().toString( 36 ).slice( 2 ),
};

/**
 * Reducer
 * @param state  - Current state
 * @param action - Action to handle
 * @returns New state
 */
const reducer = (
	state: AiBlockNotesState = initialState,
	action: AiBlockNotesAction
): AiBlockNotesState => {
	switch ( action.type ) {
		case 'ADD_IN_PROCESS_BLOCK_NOTE': {
			const existing = state.inProcessNotesByPost[ action.payload.postId ] || [];
			if ( existing.includes( action.payload.noteId ) ) {
				return state;
			}
			return {
				...state,
				inProcessNotesByPost: {
					...state.inProcessNotesByPost,
					[ action.payload.postId ]: [ ...existing, action.payload.noteId ],
				},
			};
		}
		case 'REMOVE_IN_PROCESS_BLOCK_NOTE': {
			const existing = state.inProcessNotesByPost[ action.payload.postId ] || [];
			return {
				...state,
				inProcessNotesByPost: {
					...state.inProcessNotesByPost,
					[ action.payload.postId ]: existing.filter( ( id ) => id !== action.payload.noteId ),
				},
			};
		}
		default:
			return state;
	}
};

/**
 * Actions
 */
const actions = {
	addInProcessBlockNote( noteId: number, postId: number ): AddInProcessBlockNoteAction {
		return {
			type: 'ADD_IN_PROCESS_BLOCK_NOTE',
			payload: { noteId, postId },
		};
	},

	removeInProcessBlockNote( noteId: number, postId: number ): RemoveInProcessBlockNoteAction {
		return {
			type: 'REMOVE_IN_PROCESS_BLOCK_NOTE',
			payload: { noteId, postId },
		};
	},
};

/**
 * Selectors
 */
const selectors = {
	getInProcessBlockNotes( state: AiBlockNotesState, postId: number ): number[] {
		return state.inProcessNotesByPost[ postId ] || [];
	},

	getSessionId( state: AiBlockNotesState ): string {
		return state.sessionId;
	},
};

/**
 * Create the AI Block Notes store.
 */
const aiBlockNotesStore = createReduxStore( 'ai-block-notes/store', {
	reducer,
	actions,
	selectors,
} );

// Only register if not already registered to prevent duplicate store errors
if ( ! select( aiBlockNotesStore ) ) {
	register( aiBlockNotesStore );
}

export { aiBlockNotesStore as store };
