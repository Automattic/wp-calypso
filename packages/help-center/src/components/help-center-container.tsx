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
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * This function calculates the position of the Help Center based on the last click event
 *
 * @param lastClickEvent MouseEvent object
 * @param HelpCenter node reference
 * @returns object with left and top properties
 */
export const calculateOpeningPosition = (
	clientX: number,
	clientY: number,
	HelpCenter: HTMLElement
) => {
	const { innerWidth, innerHeight } = window;
	const { offsetWidth, offsetHeight } = HelpCenter;

	let x = clientX - offsetWidth / 2;
	let y = clientY + 25;

	if ( clientX + offsetWidth / 2 > innerWidth ) {
		// In case the click was too close to the right edge of the screen, we move it to the left
		x = innerWidth - offsetWidth - 25;
	} else if ( x < 0 ) {
		// In case the click was too close to the left edge of the screen, we move it to the right
		x = 25;
	}

	if ( clientY + offsetHeight > innerHeight ) {
		// In case the click was too close to the bottom edge of the screen, we move it to the top
		y = clientY - offsetHeight - 25;
	}

	return { x, y };
};

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

const HelpCenterContainer: React.FC< Container > = ( { handleClose, hidden, currentRoute } ) => {
	const { show, isMinimized, initialRoute } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
			initialRoute: store.getInitialRoute(),
		};
	}, [] );

	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const [ isVisible, setIsVisible ] = useState( true );
	const isMobile = useMobileBreakpoint();
	const classNames = clsx( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
	} );

	const onDismiss = useCallback( () => {
		setIsVisible( false );
		recordTracksEvent( `calypso_inlinehelp_close` );
	}, [ setIsVisible, recordTracksEvent ] );

	const toggleVisible = () => {
		if ( ! isVisible ) {
			handleClose();
			// after calling handleClose, reset the visibility state to default
			setIsVisible( true );
		}
	};

	const animationProps = {
		style: {
			animation: `${ isVisible ? 'fadeIn' : 'fadeOut' } .5s`,
		},
		onAnimationEnd: toggleVisible,
	};
	// This is a workaround for an issue with Draggable in StrictMode
	// https://github.com/react-grid-layout/react-draggable/blob/781ef77c86be9486400da9837f43b96186166e38/README.md
	const nodeRef = useRef( null );

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
		<MemoryRouter initialEntries={ initialRoute ? [ initialRoute ] : undefined }>
			<FeatureFlagProvider>
				<OptionalDraggable
					defaultPosition={
						Array.isArray( show )
							? calculateOpeningPosition( show[ 0 ], show[ 1 ], {
									offsetWidth: 410,
									offsetHeight: Math.min( window.innerHeight * 0.8, 800 ),
							  } )
							: { x: 100, y: 200 }
					}
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
	);
};

export default HelpCenterContainer;
