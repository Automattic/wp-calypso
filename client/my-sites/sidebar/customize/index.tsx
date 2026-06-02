/**
 * Customize-mode orchestrator + context.
 *
 * Calypso-side mirror of the public plugin's `enterCustomizer` / `exitCustomizer`
 * (`WordPress/wp-admin-sidebar` v0.1.4 `src/customizer/customizer.js`).
 *
 * Identical-behaviour anchor — every visible behaviour mirrors the plugin
 * 1:1, only the runtime differs:
 *
 * - Body-class toggle (`is-admin-sidebar-customize-mode`) for CSS-scoped
 * overrides. Mirrors `body.wp-admin-sidebar-mode-customize` (Phase 2 row 16).
 * - Snapshot-and-restore on Cancel: the saved delta is the snapshot in
 * Calypso (the React tree re-renders against the saved delta when the
 * user cancels). Mirrors `captureLayoutSnapshot` / `restoreLayoutSnapshot`
 * (Phase 2 row 25).
 * - Working-delta state is the source of truth while customize is active.
 * The renderer applies it to the menu via `applyLayoutDelta()`. The
 * selector merge in `use-site-menu-items.js` swaps from `savedDelta` to
 * `workingDelta` when `isCustomizing` is true.
 * - beforeunload prompt while dirty (Phase 2 row 24).
 * - Save POST publishes the persisted delta back to the layout state slice;
 * the next render swaps over to it cleanly (Phase 2 row 26).
 * - Cancel-after-dirty confirm dialog (Phase 2 row 25).
 *
 * Component consumers reach the orchestrator via `useCustomizeContext()`,
 * which exposes the working delta, dispatch helpers, and refs into the
 * sidebar root (drag-drop attaches its pointer listeners on that root).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/customizer.js
 */

import { translate } from 'i18n-calypso';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { getAdminSidebarLayout } from 'calypso/state/admin-sidebar/layout/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	applySaved,
	beginDrag as beginDragState,
	cancel,
	cloneDelta,
	createDraftState,
	deltasEqual,
	endDrag as endDragState,
	moveItem,
	resetItem,
	restoreWorking,
	type CustomizerDraftState,
	updateSaved,
} from './draft-state';
import { attachDragDrop } from './drag-drop';
import { attachKeyboardReorder } from './keyboard-reorder';
import { saveLayout } from './save-flow';
import type {
	AdminSidebarLayoutSlice,
	LayoutDelta,
	LayoutPosition,
} from 'calypso/state/admin-sidebar/layout/types';
import type { ReactNode } from 'react';

export const BODY_CUSTOMIZE_CLASS = 'is-admin-sidebar-customize-mode';
export const BODY_DRAGGING_CLASS = 'is-admin-sidebar-dragging';
const MAX_UNDO_STACK = 10;

export interface CommitMoveDetails {
	previousPosition?: LayoutPosition;
	nextPosition?: LayoutPosition;
	label?: string;
}

interface UndoFrame {
	itemId: string;
	previousPosition: LayoutPosition;
	previousDelta: LayoutDelta;
	label: string;
}

type Action =
	| { type: 'set'; state: CustomizerDraftState }
	| { type: 'move'; itemId: string; position: LayoutPosition }
	| { type: 'reset_item'; itemId: string }
	| { type: 'cancel' }
	| { type: 'apply_saved'; saved: LayoutDelta }
	| { type: 'begin_drag'; itemId: string; sourcePosition: LayoutPosition }
	| { type: 'end_drag' }
	| { type: 'set_saving'; isSaving: boolean }
	| { type: 'set_save_error'; error: { code: string; message: string } | null };

function reducer( state: CustomizerDraftState, action: Action ): CustomizerDraftState {
	switch ( action.type ) {
		case 'set':
			return action.state;
		case 'move':
			return moveItem( state, action.itemId, action.position );
		case 'reset_item':
			return resetItem( state, action.itemId );
		case 'cancel':
			return cancel( state );
		case 'apply_saved':
			return applySaved( state, action.saved );
		case 'begin_drag':
			return beginDragState( state, action.itemId, action.sourcePosition );
		case 'end_drag':
			return endDragState( state );
		case 'set_saving':
			return { ...state, isSaving: action.isSaving };
		case 'set_save_error':
			return { ...state, isSaving: false, saveError: action.error };
		default:
			return state;
	}
}

export interface CustomizeController {
	isCustomizing: boolean;
	draft: CustomizerDraftState;
	enter: () => void;
	exit: ( options?: { confirmIfDirty?: boolean } ) => void;
	commitMove: ( itemId: string, position: LayoutPosition, details?: CommitMoveDetails ) => boolean;
	resetItem: ( itemId: string, details?: CommitMoveDetails ) => boolean;
	beginDrag: ( itemId: string, sourcePosition: LayoutPosition ) => void;
	endDrag: () => void;
	undo: () => void;
	retry: () => void;
	canUndo: boolean;
	hasPendingSave: boolean;
	lastSavedAt: number;
	announce: ( msg: string ) => void;
}

const CustomizeContext = createContext< CustomizeController | null >( null );

export function useCustomizeContext(): CustomizeController | null {
	return useContext( CustomizeContext );
}

/**
 * Live region for screen-reader announcements during customize mode (Phase 2
 * row 27). The element lives outside the sidebar so it's not affected by
 * inert/aria-hidden flips on the children container.
 */
function useLiveRegion(): {
	liveRef: React.RefObject< HTMLDivElement >;
	announce: ( msg: string ) => void;
} {
	const liveRef = useRef< HTMLDivElement >( null );
	const announce = useCallback( ( msg: string ) => {
		if ( ! liveRef.current ) {
			return;
		}
		// Clear first; rAF re-applies so the SR re-reads identical strings.
		liveRef.current.textContent = '';
		const el = liveRef.current;
		if ( typeof window !== 'undefined' ) {
			window.requestAnimationFrame( () => {
				if ( el ) {
					el.textContent = msg;
				}
			} );
		} else {
			el.textContent = msg;
		}
	}, [] );
	return { liveRef, announce };
}

function positionsEqual( a?: LayoutPosition, b?: LayoutPosition ): boolean {
	if ( ! a || ! b || a.kind !== b.kind || a.index !== b.index ) {
		return false;
	}
	if ( a.kind === 'in_group' ) {
		return b.kind === 'in_group' && a.group_id === b.group_id;
	}
	return true;
}

function clonePosition( position: LayoutPosition ): LayoutPosition {
	return { ...position };
}

function errorMessage( err: unknown ): string {
	return err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
		? err.message
		: ( translate( 'Save failed.' ) as string );
}

/**
 * Provider wraps the sidebar surface and exposes the controller via context.
 *
 * Owns: working-delta reducer, body-class toggling, autosave queue,
 * and beforeunload prompt.
 */
export function CustomizeProvider( {
	children,
	enableCustomize = true,
	saveLayoutImpl = saveLayout,
}: {
	children: ReactNode;
	enableCustomize?: boolean;
	saveLayoutImpl?: typeof saveLayout;
} ) {
	const reduxDispatch = useReduxDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const savedDelta = useSelector( ( state ) =>
		getAdminSidebarLayout( state as AdminSidebarLayoutSlice, siteId )
	);
	const [ isCustomizing, setCustomizing ] = useState( false );
	const [ draft, dispatch ] = useReducer( reducer, savedDelta, createDraftState );
	const [ undoStack, setUndoStack ] = useState< UndoFrame[] >( [] );
	const [ hasPendingSave, setHasPendingSave ] = useState( false );
	const [ lastSavedAt, setLastSavedAt ] = useState( 0 );
	const { liveRef, announce } = useLiveRegion();

	// Keep a ref to the latest draft so async paths (save resolution after
	// cancel-mid-fetch) can null-check without stale closures.
	const draftRef = useRef( draft );
	const undoStackRef = useRef< UndoFrame[] >( [] );
	const pendingSaveDeltaRef = useRef< LayoutDelta | null >( null );
	const savePromiseRef = useRef< Promise< void > | null >( null );
	const sessionIdRef = useRef( 0 );
	useEffect( () => {
		draftRef.current = draft;
	}, [ draft ] );

	const setDraftState = useCallback( ( next: CustomizerDraftState ) => {
		draftRef.current = next;
		dispatch( { type: 'set', state: next } );
	}, [] );

	const setUndoFrames = useCallback( ( next: UndoFrame[] ) => {
		undoStackRef.current = next;
		setUndoStack( next );
	}, [] );

	const hasUnsavedChanges = useCallback(
		() =>
			!! (
				draftRef.current.isDirty ||
				draftRef.current.isSaving ||
				pendingSaveDeltaRef.current ||
				draftRef.current.saveError
			),
		[]
	);

	const resetSessionMeta = useCallback( () => {
		pendingSaveDeltaRef.current = null;
		savePromiseRef.current = null;
		setHasPendingSave( false );
		setUndoFrames( [] );
		setLastSavedAt( 0 );
	}, [ setUndoFrames ] );

	const runAutosaveQueue = useCallback(
		async ( sessionId: number ) => {
			while ( sessionIdRef.current === sessionId && pendingSaveDeltaRef.current ) {
				const delta = pendingSaveDeltaRef.current;
				pendingSaveDeltaRef.current = null;
				setHasPendingSave( false );
				try {
					if ( ! siteId ) {
						throw new Error( translate( 'Unable to save sidebar layout.' ) as string );
					}
					const persisted = await saveLayoutImpl( reduxDispatch, {
						siteId,
						delta,
					} );
					if ( sessionIdRef.current !== sessionId ) {
						return;
					}
					const next = updateSaved( draftRef.current, persisted );
					setDraftState( next );
					setLastSavedAt( Date.now() );
					if ( pendingSaveDeltaRef.current ) {
						setDraftState( { ...draftRef.current, isSaving: true, saveError: null } );
					}
				} catch ( err ) {
					if ( sessionIdRef.current !== sessionId ) {
						return;
					}
					if ( pendingSaveDeltaRef.current ) {
						setDraftState( { ...draftRef.current, isSaving: true, saveError: null } );
						continue;
					}
					const message = errorMessage( err );
					setDraftState( {
						...draftRef.current,
						isSaving: false,
						saveError: { code: 'save_failed', message },
					} );
					announce( message );
					return;
				}
			}
			if ( sessionIdRef.current === sessionId ) {
				setDraftState( { ...draftRef.current, isSaving: false } );
			}
		},
		[ announce, reduxDispatch, saveLayoutImpl, setDraftState, siteId ]
	);

	const scheduleAutosave = useCallback(
		( delta = draftRef.current.workingDelta ) => {
			if (
				! draftRef.current.isDirty &&
				! savePromiseRef.current &&
				! draftRef.current.saveError
			) {
				return;
			}
			pendingSaveDeltaRef.current = cloneDelta( delta );
			setHasPendingSave( true );
			setDraftState( { ...draftRef.current, isSaving: true, saveError: null } );
			const sessionId = sessionIdRef.current;
			if ( ! savePromiseRef.current ) {
				const promise = runAutosaveQueue( sessionId ).finally( () => {
					if ( sessionIdRef.current === sessionId ) {
						savePromiseRef.current = null;
					}
				} );
				savePromiseRef.current = promise;
			}
		},
		[ runAutosaveQueue, setDraftState ]
	);

	const exit = useCallback(
		( options: { confirmIfDirty?: boolean } = {} ) => {
			if ( options.confirmIfDirty && hasUnsavedChanges() ) {
				if ( typeof window !== 'undefined' ) {
					const message = draftRef.current.saveError
						? ( translate(
								'Some changes could not be saved. Exit and discard unsaved changes?'
						  ) as string )
						: ( translate( 'Exit and discard unsaved changes?' ) as string );
					// eslint-disable-next-line no-alert
					if ( ! window.confirm( message ) ) {
						return;
					}
				}
			}
			sessionIdRef.current += 1;
			pendingSaveDeltaRef.current = null;
			savePromiseRef.current = null;
			setHasPendingSave( false );
			setUndoFrames( [] );
			setDraftState( cancel( draftRef.current ) );
			setCustomizing( false );
			announce( translate( 'Customize mode exited.' ) as string );
		},
		[ announce, hasUnsavedChanges, setDraftState, setUndoFrames ]
	);

	const enter = useCallback( () => {
		if ( ! enableCustomize ) {
			return;
		}
		sessionIdRef.current += 1;
		resetSessionMeta();
		// Re-bootstrap from the latest saved delta so re-entering after a save
		// sees the freshly-persisted state.
		setDraftState( createDraftState( savedDelta ) );
		setCustomizing( true );
		announce( translate( 'Customize mode entered.' ) as string );
	}, [ announce, enableCustomize, resetSessionMeta, savedDelta, setDraftState ] );

	const commitWorkingChange = useCallback(
		(
			itemId: string,
			details: CommitMoveDetails,
			mutateState: ( state: CustomizerDraftState ) => CustomizerDraftState
		) => {
			if (
				details.previousPosition &&
				details.nextPosition &&
				positionsEqual( details.previousPosition, details.nextPosition )
			) {
				return false;
			}
			const previousDelta = cloneDelta( draftRef.current.workingDelta );
			const nextState = mutateState( draftRef.current );
			if ( deltasEqual( previousDelta, nextState.workingDelta ) ) {
				setDraftState( nextState );
				return false;
			}

			setDraftState( nextState );
			if ( details.previousPosition ) {
				const nextStack = [
					...undoStackRef.current,
					{
						itemId,
						previousPosition: clonePosition( details.previousPosition ),
						previousDelta,
						label: details.label || itemId,
					},
				].slice( -MAX_UNDO_STACK );
				setUndoFrames( nextStack );
			}
			scheduleAutosave( nextState.workingDelta );
			return true;
		},
		[ scheduleAutosave, setDraftState, setUndoFrames ]
	);

	const commitMove = useCallback(
		( itemId: string, position: LayoutPosition, details: CommitMoveDetails = {} ) =>
			commitWorkingChange( itemId, { ...details, nextPosition: position }, ( state ) =>
				moveItem( state, itemId, position )
			),
		[ commitWorkingChange ]
	);

	const resetItemHandler = useCallback(
		( itemId: string, details: CommitMoveDetails = {} ) =>
			commitWorkingChange( itemId, details, ( state ) => resetItem( state, itemId ) ),
		[ commitWorkingChange ]
	);

	const beginDrag = useCallback(
		( itemId: string, sourcePosition: LayoutPosition ) => {
			setDraftState( beginDragState( draftRef.current, itemId, sourcePosition ) );
		},
		[ setDraftState ]
	);

	const endDrag = useCallback( () => {
		setDraftState( endDragState( draftRef.current ) );
	}, [ setDraftState ] );

	const undo = useCallback( () => {
		if ( draftRef.current.activeDrag || undoStackRef.current.length === 0 ) {
			return;
		}
		const frame = undoStackRef.current[ undoStackRef.current.length - 1 ];
		setUndoFrames( undoStackRef.current.slice( 0, -1 ) );
		const nextState = restoreWorking( draftRef.current, frame.previousDelta );
		setDraftState( nextState );
		scheduleAutosave( nextState.workingDelta );
		announce(
			translate( 'Undid last change for %(label)s.', {
				args: { label: frame.label },
			} ) as string
		);
	}, [ announce, scheduleAutosave, setDraftState, setUndoFrames ] );

	const retry = useCallback( () => {
		if ( draftRef.current.isSaving ) {
			return;
		}
		scheduleAutosave();
	}, [ scheduleAutosave ] );

	// Body class toggle (Phase 2 row 16).
	useEffect( () => {
		if ( typeof document === 'undefined' ) {
			return;
		}
		if ( isCustomizing ) {
			document.body.classList.add( BODY_CUSTOMIZE_CLASS );
		} else {
			document.body.classList.remove( BODY_CUSTOMIZE_CLASS );
		}
		return () => {
			if ( typeof document !== 'undefined' ) {
				document.body.classList.remove( BODY_CUSTOMIZE_CLASS );
			}
		};
	}, [ isCustomizing ] );

	// Drag-drop + keyboard reorder listeners (Phase 2 row 17 / 18 / 27).
	// Attached on enter, detached on exit so the event surface is empty when
	// customize mode is off.
	useEffect( () => {
		if ( ! isCustomizing ) {
			return;
		}
		const dragController = {
			commitMove,
			beginDrag,
			endDrag,
			announce,
		};
		const detachDrag = attachDragDrop( dragController );
		const detachKeyboard = attachKeyboardReorder( dragController );
		return () => {
			detachDrag();
			detachKeyboard();
		};
	}, [ isCustomizing, commitMove, beginDrag, endDrag, announce ] );

	// beforeunload prompt while dirty (Phase 2 row 24). Uses the legacy
	// `returnValue` trick because modern browsers ignore custom strings but
	// still show a generic confirmation when `preventDefault()` is called or
	// `returnValue` is set.
	useEffect( () => {
		if ( ! isCustomizing || ! hasUnsavedChanges() ) {
			return;
		}
		const handler = ( ev: BeforeUnloadEvent ) => {
			ev.preventDefault();
			ev.returnValue = '';
			return '';
		};
		window.addEventListener( 'beforeunload', handler );
		return () => window.removeEventListener( 'beforeunload', handler );
	}, [ isCustomizing, draft, hasPendingSave, hasUnsavedChanges ] );

	useEffect( () => {
		if ( ! isCustomizing ) {
			return;
		}
		const handler = ( ev: KeyboardEvent ) => {
			if ( ev.key !== 'Escape' || ev.defaultPrevented ) {
				return;
			}
			if ( document.querySelector( '.admin-sidebar-move-menu' ) ) {
				return;
			}
			if (
				draftRef.current.activeDrag ||
				draftRef.current.isSaving ||
				pendingSaveDeltaRef.current
			) {
				return;
			}
			ev.preventDefault();
			exit( { confirmIfDirty: true } );
		};
		document.addEventListener( 'keydown', handler );
		return () => document.removeEventListener( 'keydown', handler );
	}, [ exit, isCustomizing ] );

	const controller = useMemo< CustomizeController >(
		() => ( {
			isCustomizing,
			draft,
			enter,
			exit,
			commitMove,
			resetItem: resetItemHandler,
			beginDrag,
			endDrag,
			undo,
			retry,
			canUndo: undoStack.length > 0 && ! draft.activeDrag,
			hasPendingSave,
			lastSavedAt,
			announce,
		} ),
		[
			isCustomizing,
			draft,
			enter,
			exit,
			commitMove,
			resetItemHandler,
			beginDrag,
			endDrag,
			undo,
			retry,
			undoStack,
			hasPendingSave,
			lastSavedAt,
			announce,
		]
	);

	return (
		<CustomizeContext.Provider value={ controller }>
			{ children }
			<div
				ref={ liveRef }
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="admin-sidebar-customize-live-region"
			/>
		</CustomizeContext.Provider>
	);
}
