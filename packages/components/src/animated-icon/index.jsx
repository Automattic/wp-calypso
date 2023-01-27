import classNames from 'classnames';
import lottie from 'lottie-web/build/player/lottie_light';
import { useEffect, useRef } from 'react';

const AnimatedIcon = ( { icon, className } ) => {
	const iconEl = useRef();

	useEffect( () => {
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		const iconParam = typeof icon === 'string' ? { path: icon } : { animationData: icon };

		const animation = lottie.loadAnimation( {
			container: iconEl.current,
			renderer: 'svg',
			loop: false,
			autoplay: ! reducedMotion,
			...iconParam,
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

	return <div ref={ iconEl } className={ classNames( 'animated-icon', className ) }></div>;
};

export default AnimatedIcon;
