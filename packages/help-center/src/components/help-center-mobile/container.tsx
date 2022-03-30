import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { Container } from '../types';
import HelpCenterMobileContent from './content';
import HelpCenterMobileHeader from './header';

import './style.scss';

const HelpCenterMobileContainer: React.FC< Container > = ( { content, handleClose } ) => {
	const [ isVisible, setIsVisible ] = useState( true );
	const [ isMinimized, setIsMinimized ] = useState( false );

	useEffect( () => {
		if ( isVisible ) setIsVisible( true );
		if ( ! isVisible ) setIsVisible( false );
	}, [ isVisible ] );

	const toggleVisible = () => {
		if ( ! isVisible ) {
			handleClose();
		}
	};

	return (
		<div
			style={ { animation: `${ isVisible ? 'slideIn' : 'slideOut' } .5s` } }
			onAnimationEnd={ toggleVisible }
			className={ classnames( { minimized: isMinimized }, 'help-center-mobile__overlay' ) }
		>
			<HelpCenterMobileHeader
				isMinimized={ isMinimized }
				onMinimize={ () => setIsMinimized( true ) }
				onMaximize={ () => setIsMinimized( false ) }
				onDismiss={ () => setIsVisible( false ) }
			/>
			{ ! isMinimized && <HelpCenterMobileContent content={ content } /> }
		</div>
	);
};

export default HelpCenterMobileContainer;
