/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
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

const HelpCenterContainer: React.FC< Container > = ( {
	content,
	handleClose,
	headerText,
	footerContent,
} ) => {
	const { __ } = useI18n();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const isMobile = useMobileBreakpoint();
	const classNames = classnames( 'help-center__container', isMobile ? 'is-mobile' : 'is-desktop', {
		'is-minimized': isMinimized,
		'no-footer': ! footerContent,
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

	const header = isMinimized ? headerText ?? __( 'Help Center' ) : __( 'Help Center' );

	const containerContent = (
		<>
			<HelpCenterHeader
				isMinimized={ isMinimized }
				onMinimize={ () => setIsMinimized( true ) }
				onMaximize={ () => setIsMinimized( false ) }
				onDismiss={ onDismiss }
				headerText={ header }
			/>
			{ ! isMinimized && (
				<>
					<HelpCenterContent content={ content } />
					{ footerContent && <HelpCenterFooter footerContent={ footerContent } /> }
				</>
			) }
		</>
	);

	if ( isMobile ) {
		return (
			<Card { ...animationProps } className={ classNames }>
				{ containerContent }
			</Card>
		);
	}

	return isMinimized ? (
		<Card className={ classNames } { ...animationProps }>
			{ containerContent }
		</Card>
	) : (
		<Draggable>
			<Card className={ classNames } { ...animationProps }>
				{ containerContent }
			</Card>
		</Draggable>
	);
};

export default HelpCenterContainer;
