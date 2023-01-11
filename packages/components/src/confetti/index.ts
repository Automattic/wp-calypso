import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const COLORS = [
	'#F2D76B',
	'#31CC9F',
	'#E34C84',
	'#31CC9F',
	'#31CC9F',
	'#B35EB1',
	'#FAA754',
	'#6AB3D0',
	'#618DF2',
	'#6AB3D0',
	'#618DF2',
	'#B35EB1',
	'#F2D76B',
	'#FAA754',
];

type FireOptions = {
	spread: number;
	startVelocity?: number;
	decay?: number;
	scalar?: number;
};

function fireConfetti() {
	const count = 200;
	const defaults = {
		origin: { y: 0.7 },
		colors: COLORS,
	};

	function fire( particleRatio: number, opts: FireOptions ) {
		confetti(
			Object.assign( {}, defaults, opts, {
				particleCount: Math.floor( count * particleRatio ),
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

const ConfettiAnimation = ( { trigger = true } ) => {
	useEffect( () => {
		if ( trigger ) {
			fireConfetti();
		}
	}, [ trigger ] );

	return null;
};

export default ConfettiAnimation;
