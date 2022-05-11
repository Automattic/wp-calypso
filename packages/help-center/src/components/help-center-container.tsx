/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Card } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState, FC } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
/**
 * Internal Dependencies
 */
import { HelpCenterContext } from '../help-center-context';
import { Article, Container } from '../types';
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

const HelpCenterContainer: React.FC< Container > = ( {
	content,
	handleClose,
	defaultHeaderText,
	defaultFooterContent,
} ) => {
	const { __ } = useI18n();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const isMobile = useMobileBreakpoint();
	const [ headerText, setHeaderText ] = useState< React.ReactNode >( defaultHeaderText );
	const [ footerContent, setFooterContent ] = useState< React.ReactNode >( defaultFooterContent );
	const [ selectedArticle, setSelectedArticle ] = useState< Article | null >( null );
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

	return (
		<OptionalDraggable
			disabled={ isMinimized }
			draggable={ ! isMobile }
			handle=".help-center__container-header"
			bounds="body"
		>
			<Card className={ classNames } { ...animationProps }>
				<HelpCenterContext.Provider
					value={ {
						headerText,
						setHeaderText,
						footerContent,
						setFooterContent,
						selectedArticle,
						setSelectedArticle,
					} }
				>
					<HelpCenterHeader
						isMinimized={ isMinimized }
						onMinimize={ () => setIsMinimized( true ) }
						onMaximize={ () => setIsMinimized( false ) }
						onDismiss={ onDismiss }
						headerText={ header }
					/>
					<HelpCenterContent isMinimized={ isMinimized } content={ content } />
					{ footerContent && ! isMinimized && <HelpCenterFooter footerContent={ footerContent } /> }
				</HelpCenterContext.Provider>
			</Card>
		</OptionalDraggable>
	);
};

export default HelpCenterContainer;
