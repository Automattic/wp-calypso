import React, { useEffect, useState } from 'react';
import './help-center-animation.scss';

interface HelpCenterAnimationWrapperProps {
	children: React.ReactNode;
	visible: boolean;
	duration?: number;
	animationEnd?: () => void;
}

const HelpCenterAnimationWrapper = ( {
	children,
	visible,
	duration = 200,
	animationEnd,
}: HelpCenterAnimationWrapperProps ) => {
	const [ shouldRender, setRender ] = useState( visible );

	useEffect( () => {
		if ( visible ) {
			setRender( true );
		}
	}, [ visible ] );

	const onAnimationEnd = () => {
		if ( ! visible ) {
			setRender( false );
			animationEnd?.();
		}
	};

	return shouldRender ? (
		<div
			style={ { animationDuration: `${ duration }ms` } }
			className={ `fade ${ visible ? 'fade-in' : 'fade-out' }` }
			onAnimationEnd={ onAnimationEnd }
		>
			{ children }
		</div>
	) : null;
};

export default HelpCenterAnimationWrapper;
