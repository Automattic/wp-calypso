/**
 * External Dependencies
 */
import useRaiseOnFocus from '@automattic/agents-manager/src/hooks/use-raise-on-focus';
import { useWindowDimensions } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import {
	useConstrainedTabbing,
	useFocusOnMount,
	useFocusReturn,
	useMergeRefs,
} from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useRef, useEffect, useCallback, FC, useState, type RefObject } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useActionHooks } from '../hooks';
import { useHelpCenterTracksEvent } from '../hooks/use-help-center-tracks-event';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import { ZendeskStagingNotice } from './help-center-zendesk-staging-notice';
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
	const recordTracksEvent = useHelpCenterTracksEvent();
	const nodeRef = useRef< HTMLDivElement >( null );
	const isMobile = useMobileBreakpoint();
	const [ node, setNode ] = useState< HTMLElement | null >( null );
	const classNames = clsx( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
	} );

	useActionHooks();

	const onDismiss = useCallback( () => {
		handleClose();
		recordTracksEvent( 'calypso_inlinehelp_close', {
			section: sectionName,
		} );
	}, [ handleClose, recordTracksEvent, sectionName ] );

	const focusReturnRef = useFocusReturn();

	// Focus the dialog itself on open so keyboard/screen-reader users land in
	// the Help Center (announcing its title) instead of having to tab through
	// the whole page to reach it. On desktop the dialog is deliberately
	// non-modal — no focus trap — so users can keep interacting with the page
	// underneath. The mobile sheet covers the viewport behind a scrim, so there
	// it presents as modal: constrain tabbing to match.
	const focusOnMountRef = useFocusOnMount( true );
	const constrainedTabbingRef = useConstrainedTabbing();
	const isModalSheet = isMobile && ! isMinimized;

	const cardMergeRefs = useMergeRefs( [
		nodeRef,
		setNode,
		focusReturnRef,
		focusOnMountRef,
		isModalSheet ? constrainedTabbingRef : null,
	] );

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

	useRaiseOnFocus( node, ! isMinimized );

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
				<Card
					className={ classNames }
					ref={ cardMergeRefs }
					role="dialog"
					aria-modal={ isModalSheet || undefined }
					aria-labelledby="header-text"
					tabIndex={ -1 }
				>
					<HelpCenterHeader onDismiss={ onDismiss } />
					{ ! isMinimized && <ZendeskStagingNotice /> }
					<HelpCenterContent currentRoute={ currentRoute } />
					{ ! isMinimized && <HelpCenterFooter /> }
				</Card>
			</OptionalDraggable>
		</PersistentRouter>
	);
};

export default HelpCenterContainer;
