/**
 * External Dependencies
 */
import { Spinner } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import classnames from 'classnames';
import { useState, useRef, FC } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
import { MemoryRouter } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { Container } from '../types';
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';

interface OptionalDraggableProps extends Partial< DraggableProps > {
	draggable: boolean;
}

const OptionalDraggable: FC< OptionalDraggableProps > = ( { draggable, ...props } ) => {
	if ( ! draggable ) {
		return <>{ props.children }</>;
	}
	return <Draggable { ...props } />;
};

const HelpCenterContainer: React.FC< Container > = ( { handleClose, isLoading } ) => {
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const isMobile = useMobileBreakpoint();
	const classNames = classnames( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
	} );

	const onDismiss = () => {
		setIsVisible( false );
	};

	const toggleVisible = () => {
		if ( ! isVisible ) {
			handleClose();
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

	return (
		<MemoryRouter>
			<FeatureFlagProvider>
				<OptionalDraggable
					draggable={ ! isMobile }
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
						{ isLoading ? (
							<div className="help-center-container__loading">
								<Spinner baseClassName="" className="help-center-container__spinner" />
							</div>
						) : (
							<>
								<HelpCenterContent isMinimized={ isMinimized } />
								{ ! isMinimized && <HelpCenterFooter /> }
							</>
						) }
					</Card>
				</OptionalDraggable>
			</FeatureFlagProvider>
		</MemoryRouter>
	);
};

export default HelpCenterContainer;
