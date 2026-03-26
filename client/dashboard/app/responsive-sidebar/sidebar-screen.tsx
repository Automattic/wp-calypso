import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
} from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { useEffect, useRef } from 'react';

const SLIDE_DISTANCE = 100;

const transition = {
	x: { duration: 0.3, ease: [ 0.33, 0, 0, 1 ] as number[] },
	opacity: { duration: 0.15 },
};

/**
 * Animates sidebar screen transitions with slide + fade on enter.
 * Uses Framer Motion (via @wordpress/components) for reliable animation
 * that persists across React re-renders.
 */
export default function SidebarScreenTransition( {
	screenKey,
	isBack,
	children,
}: {
	screenKey: string;
	isBack: boolean;
	children: React.ReactNode;
} ) {
	const prefersReducedMotion = useReducedMotion();
	const isFirstRender = useRef( true );

	useEffect( () => {
		isFirstRender.current = false;
	}, [] );

	const shouldAnimate = ! isFirstRender.current && ! prefersReducedMotion;

	return (
		<motion.div
			key={ screenKey }
			className="dashboard-sidebar-screen"
			initial={
				shouldAnimate ? { x: isBack ? -SLIDE_DISTANCE : SLIDE_DISTANCE, opacity: 0 } : false
			}
			animate={ { x: 0, opacity: 1 } }
			transition={ transition }
		>
			{ children }
		</motion.div>
	);
}
