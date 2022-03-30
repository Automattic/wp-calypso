import { useEffect, useState } from 'react';
import { Container } from '../types';
import HelpCenterMobileHeader from './header';

import './style.scss';

const HelpCenterMobileContainer: React.FC< Container > = ( { content, handleClose } ) => {
	const [ isVisible, setIsVisible ] = useState( true );

	useEffect( () => {
		if ( isVisible ) setIsVisible( true );
		if ( ! isVisible ) setIsVisible( false );
	}, [ isVisible ] );

	const toggle = () => {
		if ( ! isVisible ) {
			handleClose();
		}
	};

	return (
		<div
			style={ { animation: `${ isVisible ? 'slideIn' : 'slideOut' } .5s` } }
			onAnimationEnd={ toggle }
			className={ 'help-center-mobile__overlay' }
		>
			<HelpCenterMobileHeader onDismiss={ () => setIsVisible( false ) } />
			<div className={ 'help-center-mobile__content' }>{ content }</div>
		</div>
	);
};

export default HelpCenterMobileContainer;
