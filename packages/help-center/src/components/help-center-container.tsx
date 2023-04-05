/**
 * External Dependencies
 */
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useState, useRef, FC } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import { HistoryRecorder } from './history-recorder';
import type { HelpCenterSelect } from '@automattic/data-stores';

interface OptionalDraggableProps extends Partial< DraggableProps > {
	draggable: boolean;
}

const OptionalDraggable: FC< OptionalDraggableProps > = ( { draggable, ...props } ) => {
	if ( ! draggable ) {
		return <>{ props.children }</>;
	}
	return <Draggable { ...props } />;
};

const HelpCenterContainer: React.FC< Container > = ( { handleClose, hidden } ) => {
	const { show, isMinimized } = useSelect(
		( select ) => ( {
			show: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
			isMinimized: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getIsMinimized(),
		} ),
		[]
	);

	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const [ isVisible, setIsVisible ] = useState( true );
	const isMobile = useMobileBreakpoint();
	const classNames = classnames( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
	} );
	const { data: supportAvailability } = useSupportAvailability( 'CHAT' );
	const { data } = useHappychatAvailable( Boolean( supportAvailability?.is_user_eligible ) );
	const { history, index } = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getRouterState(),
		[]
	);

	const onDismiss = () => {
		setIsVisible( false );
	};

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

	if ( ! show || hidden ) {
		return null;
	}

	console.log( data?.status );
	return (
		<MemoryRouter initialEntries={ history } initialIndex={ index }>
			{ data?.status === 'assigned' && (
				<Routes>
					<Route path="*" element={ <Navigate to="/inline-chat?session=continued" replace /> } />
				</Routes>
			) }
			<HistoryRecorder />
			<FeatureFlagProvider>
				<OptionalDraggable
					draggable={ ! isMobile && ! isMinimized }
					nodeRef={ nodeRef }
					handle=".help-center__container-header"
					bounds="body"
				>
					<Card className={ classNames } { ...animationProps } ref={ nodeRef }>
						<HelpCenterHeader
							isMinimized={ isMinimized }
							onMinimize={ () => setIsMinimized( true ) }
							onMaximize={ () => setIsMinimized( false ) }
							onDismiss={ onDismiss }
						/>
						<HelpCenterContent />
						{ ! isMinimized && <HelpCenterFooter /> }
					</Card>
				</OptionalDraggable>
			</FeatureFlagProvider>
		</MemoryRouter>
	);
};

export default HelpCenterContainer;
