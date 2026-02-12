/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useWindowDimensions } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card, __experimentalElevation as Elevation } from '@wordpress/components';
import { useFocusReturn, useMergeRefs } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useRef, useEffect, useCallback, FC, useState } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
/**
 * Internal Dependencies
 */
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
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
	const classNames = clsx( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
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

	if ( ! show || hidden ) {
		return null;
	}

	return (
		<PersistentRouter>
			<FeatureFlagProvider>
				<OptionalDraggable
					draggable={ ! isMobile && ! isMinimized }
					nodeRef={ nodeRef }
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
			</FeatureFlagProvider>
		</PersistentRouter>
	);
};

export default HelpCenterContainer;
