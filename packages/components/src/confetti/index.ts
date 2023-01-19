import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const COLORS = [ '#31CC9F', '#618DF2', '#6AB3D0', '#B35EB1', '#F2D76B', '#FAA754', '#E34C84' ];

type FireOptions = {
	spread: number;
	startVelocity?: number;
	decay?: number;
	scalar?: number;
};

function fireConfetti() {
	const count = 60;
	const scale = 2;
	const defaults = {
		origin: { y: 0.4 },
		colors: COLORS,
		scalar: scale,
		spread: 180,
		gravity: 6,
	};

	function fire( particleRatio: number, opts: FireOptions ) {
		confetti(
			Object.assign( {}, defaults, opts, {
				particleCount: Math.floor( count * particleRatio ),
				startVelocity: opts.startVelocity ? scale * opts.startVelocity : undefined,
				spread: scale * opts.spread,
				scalar: opts.scalar ? scale * opts.scalar : scale,
			} )
		);
	}

	fire( 0.25, {
		spread: 26,
		startVelocity: 55,
	} );
	fire( 0.2, {
		spread: 60,
	} );
	fire( 0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	} );
	fire( 0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2,
	} );
	fire( 0.1, {
		spread: 120,
		startVelocity: 45,
	} );
}

const ConfettiAnimation = ( { trigger = true, delay = 0 } ) => {
	useEffect( () => {
		if ( trigger ) {
			setTimeout( () => fireConfetti(), delay );
		}
	}, [ trigger, delay ] );

	return null;
};

export default ConfettiAnimation;
