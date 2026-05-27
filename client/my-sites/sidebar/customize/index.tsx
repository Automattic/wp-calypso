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
	createDraftState,
	endDrag as endDragState,
	moveItem,
	resetItem,
	type CustomizerDraftState,
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
	commitMove: ( itemId: string, position: LayoutPosition ) => void;
	resetItem: ( itemId: string ) => void;
	beginDrag: ( itemId: string, sourcePosition: LayoutPosition ) => void;
	endDrag: () => void;
	save: () => Promise< void >;
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

/**
 * Provider wraps the sidebar surface and exposes the controller via context.
 *
 * Owns: working-delta reducer, body-class toggling, beforeunload prompt,
 * Save dispatch.
 */
export function CustomizeProvider( {
	children,
	enableCustomize = true,
}: {
	children: ReactNode;
	enableCustomize?: boolean;
} ) {
	const reduxDispatch = useReduxDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const savedDelta = useSelector( ( state ) =>
		getAdminSidebarLayout( state as AdminSidebarLayoutSlice, siteId )
	);
	const [ isCustomizing, setCustomizing ] = useState( false );
	const [ draft, dispatch ] = useReducer( reducer, savedDelta, createDraftState );
	const { liveRef, announce } = useLiveRegion();

	// Keep a ref to the latest draft so async paths (save resolution after
	// cancel-mid-fetch) can null-check without stale closures.
	const draftRef = useRef( draft );
	useEffect( () => {
		draftRef.current = draft;
	}, [ draft ] );

	const enter = useCallback( () => {
		if ( ! enableCustomize ) {
			return;
		}
		// Re-bootstrap from the latest saved delta so re-entering after a save
		// sees the freshly-persisted state.
		dispatch( { type: 'set', state: createDraftState( savedDelta ) } );
		setCustomizing( true );
		announce( translate( 'Customize mode entered.' ) as string );
	}, [ enableCustomize, savedDelta, announce ] );

	const exit = useCallback(
		( options: { confirmIfDirty?: boolean } = {} ) => {
			if ( options.confirmIfDirty && draftRef.current.isDirty ) {
				if ( typeof window !== 'undefined' ) {
					// eslint-disable-next-line no-alert
					if ( ! window.confirm( translate( 'Discard your unsaved changes?' ) as string ) ) {
						return;
					}
				}
			}
			dispatch( { type: 'cancel' } );
			setCustomizing( false );
			announce( translate( 'Customize mode exited.' ) as string );
		},
		[ announce ]
	);

	const commitMove = useCallback( ( itemId: string, position: LayoutPosition ) => {
		dispatch( { type: 'move', itemId, position } );
	}, [] );

	const resetItemHandler = useCallback( ( itemId: string ) => {
		dispatch( { type: 'reset_item', itemId } );
	}, [] );

	const beginDrag = useCallback( ( itemId: string, sourcePosition: LayoutPosition ) => {
		dispatch( { type: 'begin_drag', itemId, sourcePosition } );
	}, [] );

	const endDrag = useCallback( () => {
		dispatch( { type: 'end_drag' } );
	}, [] );

	const save = useCallback( async () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( { type: 'set_saving', isSaving: true } );
		try {
			const persisted = await saveLayout( reduxDispatch, {
				siteId,
				delta: draftRef.current.workingDelta,
			} );
			dispatch( { type: 'apply_saved', saved: persisted } );
			setCustomizing( false );
			announce( translate( 'Sidebar saved.' ) as string );
		} catch ( err ) {
			const message =
				err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
					? err.message
					: ( translate( 'Save failed.' ) as string );
			dispatch( {
				type: 'set_save_error',
				error: { code: 'save_failed', message },
			} );
			announce( message );
		}
	}, [ siteId, reduxDispatch, announce ] );

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
		if ( ! isCustomizing || ! draft.isDirty ) {
			return;
		}
		const handler = ( ev: BeforeUnloadEvent ) => {
			ev.preventDefault();
			ev.returnValue = '';
			return '';
		};
		window.addEventListener( 'beforeunload', handler );
		return () => window.removeEventListener( 'beforeunload', handler );
	}, [ isCustomizing, draft.isDirty ] );

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
			save,
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
			save,
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
