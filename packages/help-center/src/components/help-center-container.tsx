/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import { useFocusReturn, useMergeRefs } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import clsx from 'clsx';
import { useState, useRef, useEffect, useCallback, FC } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
import { MemoryRouter } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterAnimationWrapper from './help-center-animation-wrapper';
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import type { HelpCenterSelect } from '@automattic/data-stores';

interface OptionalDraggableProps extends Partial< DraggableProps > {
	draggable: boolean;
	children?: React.ReactNode;
}

const OptionalDraggable: FC< OptionalDraggableProps > = ( { draggable, ...props } ) => {
	if ( ! draggable ) {
		return <>{ props.children }</>;
	}
	return <Draggable { ...props } />;
};

const HelpCenterContainer: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute,
	openingCoordinates,
} ) => {
	const { show, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const nodeRef = useRef< HTMLDivElement >( null );

	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );
	const [ isVisible, setIsVisible ] = useState( false );
	const isMobile = useMobileBreakpoint();
	const classNames = clsx( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
	} );

	const onDismiss = useCallback( () => {
		handleClose();
		recordTracksEvent( `calypso_inlinehelp_close` );
	}, [ handleClose ] );

	useEffect( () => {
		// Show prop can be undefined, so we default to false.
		setIsVisible( show || false );
	}, [ show ] );

	const animationProps = {
		style: {
			// These are overwritten by the openingCoordinates.
			// They are set to avoid Help Center from not loading on the page.
			...( ! isMobile && { top: 70, left: 'calc( 100vw - 500px )' } ),
			...openingCoordinates,
		},
	};

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

	if ( hidden ) {
		return null;
	}

	return (
		<HelpCenterAnimationWrapper visible={ isVisible } duration={ 200 }>
			<MemoryRouter>
				<FeatureFlagProvider>
					<OptionalDraggable
						draggable={ ! isMobile && ! isMinimized }
						nodeRef={ nodeRef }
						handle=".help-center__container-header"
						bounds="body"
					>
						<Card className={ classNames } { ...animationProps } ref={ cardMergeRefs }>
							<HelpCenterHeader
								isMinimized={ isMinimized }
								onMinimize={ () => setIsMinimized( true ) }
								onMaximize={ () => setIsMinimized( false ) }
								onDismiss={ onDismiss }
							/>
							<HelpCenterContent currentRoute={ currentRoute } />
							{ ! isMinimized && <HelpCenterFooter /> }
						</Card>
					</OptionalDraggable>
				</FeatureFlagProvider>
			</MemoryRouter>
		</HelpCenterAnimationWrapper>
	);
};

export default HelpCenterContainer;
