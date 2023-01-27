import classNames from 'classnames';
import lottie from 'lottie-web/build/player/lottie_light';
import { useEffect, useRef } from 'react';

const AnimatedIcon = ( { icon, className, playUponViewportEntry = false } ) => {
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

		if ( ! reducedMotion && playUponViewportEntry ) {
			// IntersectionObserver is used to play the animation when the icon is visible/in the browser's viewport.
			// The threshold is set to 0.5, which means that the animation will be paused when the icon is less than 50% visible.
			const observer = new IntersectionObserver(
				function ( entries ) {
					entries[ 0 ].isIntersecting === true ? animation.play() : animation.goToAndStop( 0, 0 );
				},
				{ threshold: 0.5 }
			);

			observer.observe( iconEl.current );
		}

		return () => animation.destroy();
	}, [ icon ] );

	return <div ref={ iconEl } className={ classNames( 'animated-icon', className ) }></div>;
};

export default AnimatedIcon;
