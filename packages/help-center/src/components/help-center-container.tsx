/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import classnames from 'classnames';
import { useState } from 'react';
import Draggable from 'react-draggable';
/**
 * Internal Dependencies
 */
import HelpCenterContent from './help-center-content';
import HelpCenterFooter from './help-center-footer';
import HelpCenterHeader from './help-center-header';
import { Container } from './types';

const HelpCenterContainer: React.FC< Container > = ( { content, handleClose } ) => {
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
			animation: isMobile
				? `${ isVisible ? 'pullUp' : 'pullDown' } .5s`
				: `${ isVisible ? 'slideIn' : 'slideOut' } .5s`,
		},
		onAnimationEnd: toggleVisible,
	};

	const containerContent = (
		<>
			<HelpCenterHeader
				isMinimized={ isMinimized }
				onMinimize={ () => setIsMinimized( true ) }
				onMaximize={ () => setIsMinimized( false ) }
				onDismiss={ onDismiss }
			/>
			{ ! isMinimized && (
				<>
					<HelpCenterContent content={ content } />
					<HelpCenterFooter />
				</>
			) }
		</>
	);

	return (
		<Draggable disabled={ isMinimized }>
			<Card className={ classNames } { ...animationProps }>
				{ containerContent }
			</Card>
		</Draggable>
	);
};

export default HelpCenterContainer;
