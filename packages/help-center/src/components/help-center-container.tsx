/**
 * External Dependencies
 */
import observeEditorCanvasPointerDown from '@automattic/agents-manager/src/utils/observe-editor-canvas-pointerdown';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useWindowDimensions } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card, __experimentalElevation as Elevation } from '@wordpress/components';
import { useFocusReturn, useMergeRefs } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useRef, useEffect, useCallback, FC, useState, type RefObject } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useActionHooks } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import { PersistentRouter } from './persistent-router';
import type { HelpCenterSelect } from '@automattic/data-stores';
interface OptionalDraggableProps extends Partial< DraggableProps > {
	draggable: boolean;
	children?: React.ReactNode;
}

const DEFAULT_POSITION = { x: 0, y: 0 };

const OptionalDraggable: FC< OptionalDraggableProps > = ( { draggable, ...props } ) => {
	const dims = useWindowDimensions();
	const [ position, setPosition ] = useState( { x: 0, y: 0 } );

	useEffect( () => {
		// Reset drag position when window dimensions change
		setPosition( DEFAULT_POSITION );
	}, [ dims.width, dims.height ] );

	return (
		<Draggable
			position={ draggable ? position : DEFAULT_POSITION }
			onDrag={ ( _, p ) => draggable && setPosition( p ) }
			bounds="body"
			{ ...props }
		/>
	);
};

const HelpCenterContainer: React.FC< Container > = ( { handleClose, hidden, currentRoute } ) => {
	const { show, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );
	const { sectionName } = useHelpCenterContext();
	const nodeRef = useRef< HTMLDivElement >( null );
	const isMobile = useMobileBreakpoint();
	const [ isFocused, setIsFocused ] = useState( false );
	const classNames = clsx( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
		'is-focused': isFocused,
	} );

	useActionHooks();

	const onDismiss = useCallback( () => {
		handleClose();
		recordTracksEvent( 'calypso_inlinehelp_close', {
			section: sectionName,
		} );
	}, [ handleClose, sectionName ] );

	const focusReturnRef = useFocusReturn();

	const cardMergeRefs = useMergeRefs( [ nodeRef, focusReturnRef ] );

	const shouldCloseOnEscapeRef = useRef( false );

	shouldCloseOnEscapeRef.current = !! show && ! hidden && ! isMinimized;

	useEffect( () => {
		const handleKeydown = ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' && shouldCloseOnEscapeRef.current ) {
				onDismiss();
			}
		};

		document.addEventListener( 'keydown', handleKeydown );
		return () => {
			document.removeEventListener( 'keydown', handleKeydown );
		};
	}, [ shouldCloseOnEscapeRef, onDismiss ] );

	// Track focus so this panel can raise its z-index above the Agents Manager
	// panel when the user interacts with it. `pointerdown` also covers clicks on
	// non-focusable regions (drag handle, scroll area) that don't fire `focusin`.
	useEffect( () => {
		const node = nodeRef.current;
		if ( ! node ) {
			return;
		}
		// Raise the panel on open so it paints above Agents Manager. Paint-order
		// only — no real DOM focus. The handlers below still demote it afterward.
		if ( show && ! hidden ) {
			setIsFocused( true );
		}
		const handleFocusIn = () => {
			setIsFocused( true );
		};
		let pendingFocusOut: number | undefined;
		const handleFocusOut = () => {
			// Defer: in-panel navigation unmounts the focused element, transiently
			// dropping focus to <body>. Re-test activeElement after focus settles so
			// we only demote when it truly moved to a real element outside the panel.
			if ( pendingFocusOut !== undefined ) {
				cancelAnimationFrame( pendingFocusOut );
			}
			pendingFocusOut = requestAnimationFrame( () => {
				pendingFocusOut = undefined;
				const active = document.activeElement;
				if ( active !== document.body && ! node.contains( active ) ) {
					setIsFocused( false );
				}
			} );
		};
		const handlePointerDown = () => {
			setIsFocused( true );
		};
		const handleDocumentPointerDown = ( e: PointerEvent ) => {
			if ( ! node.contains( e.target as Node | null ) ) {
				setIsFocused( false );
			}
		};

		node.addEventListener( 'focusin', handleFocusIn );
		node.addEventListener( 'focusout', handleFocusOut );
		node.addEventListener( 'pointerdown', handlePointerDown );
		document.addEventListener( 'pointerdown', handleDocumentPointerDown );
		const stopCanvasObserver = observeEditorCanvasPointerDown( handleDocumentPointerDown );

		return () => {
			if ( pendingFocusOut !== undefined ) {
				cancelAnimationFrame( pendingFocusOut );
			}
			node.removeEventListener( 'focusin', handleFocusIn );
			node.removeEventListener( 'focusout', handleFocusOut );
			node.removeEventListener( 'pointerdown', handlePointerDown );
			document.removeEventListener( 'pointerdown', handleDocumentPointerDown );
			stopCanvasObserver();
		};
	}, [ show, hidden ] );

	if ( ! show || hidden ) {
		return null;
	}

	return (
		<PersistentRouter>
			<OptionalDraggable
				draggable={ ! isMobile && ! isMinimized }
				// react-draggable's nodeRef type predates React 19's nullable ref objects.
				nodeRef={ nodeRef as RefObject< HTMLElement > }
				handle=".help-center-header__text"
				bounds="body"
			>
				<Card className={ classNames } ref={ cardMergeRefs }>
					<HelpCenterHeader onDismiss={ onDismiss } />
					<HelpCenterContent currentRoute={ currentRoute } />
					{ ! isMinimized && <HelpCenterFooter /> }
					{ ! isMobile && (
						<Elevation
							borderRadius={ isMinimized ? '16px 16px 0 0' : '16px' }
							value={ 4 }
						></Elevation>
					) }
				</Card>
			</OptionalDraggable>
		</PersistentRouter>
	);
};

export default HelpCenterContainer;
