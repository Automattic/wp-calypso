import clsx from 'clsx';
import lottie from 'lottie-web/build/player/lottie_light';
import { useEffect, useRef } from 'react';

const AnimatedIcon = ( { icon, className } ) => {
	const iconEl = useRef();

	useEffect( () => {
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		const animation = lottie.loadAnimation( {
			container: iconEl.current,
			renderer: 'svg',
			loop: false,
			autoplay: ! reducedMotion,
			path: icon,
			rendererSettings: {
				viewBoxOnly: true,
			},
		} );

		if ( reducedMotion ) {
			animation.addEventListener( 'config_ready', () => {
				animation.goToAndPlay( animation.totalFrames, true );
			} );
		}

		return () => animation.destroy();
	}, [ icon ] );

	return <div ref={ iconEl } className={ clsx( 'animated-icon', className ) }></div>;
};

export default AnimatedIcon;
