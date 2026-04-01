import confetti from 'canvas-confetti';

const COLORS = [ '#31CC9F', '#618DF2', '#6AB3D0', '#B35EB1', '#F2D76B', '#FAA754', '#E34C84' ];

export function fireConfetti() {
	if ( window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches ) {
		return;
	}

	const count = 60;
	const scale = 2;
	const defaults = {
		origin: { y: 0.4 },
		colors: COLORS,
		scalar: scale,
		spread: 180,
		gravity: 6,
	};

	function fire( particleRatio, opts ) {
		confetti(
			Object.assign( {}, defaults, opts, {
				particleCount: Math.floor( count * particleRatio ),
				startVelocity: opts.startVelocity ? scale * opts.startVelocity : undefined,
				spread: scale * opts.spread,
				scalar: opts.scalar ? scale * opts.scalar : scale,
				zIndex: 1000000,
			} )
		);
	}

	fire( 0.25, { spread: 26, startVelocity: 55 } );
	fire( 0.2, { spread: 60 } );
	fire( 0.35, { spread: 100, decay: 0.91, scalar: 0.8 } );
	fire( 0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 } );
	fire( 0.1, { spread: 120, startVelocity: 45 } );
}
