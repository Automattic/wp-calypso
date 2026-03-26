import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
} from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { useLayoutEffect, useRef, useState } from 'react';

const SLIDE_DISTANCE = 100;

const transition = {
	x: { duration: 0.3, ease: [ 0.33, 0, 0, 1 ] as number[] },
	opacity: { duration: 0.15 },
};

interface ExitingScreen {
	key: string;
	content: React.ReactNode;
	exitX: number;
}

/**
 * Animates sidebar screen transitions with slide + fade.
 *
 * Keeps a snapshot of the previous screen so it can animate out while
 * the new screen slides in. Uses `animate` (not `initial`) to drive
 * the enter animation so it works regardless of React render timing.
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
	const prevKeyRef = useRef( screenKey );
	const prevChildrenRef = useRef< React.ReactNode >( children );
	const [ exiting, setExiting ] = useState< ExitingScreen | null >( null );

	// The enter position: start offset, then animate to center.
	// `null` means no transition needed (initial render or same screen).
	const [ enterX, setEnterX ] = useState< number | null >( null );

	useLayoutEffect( () => {
		if ( screenKey !== prevKeyRef.current && ! prefersReducedMotion ) {
			// Snapshot previous screen for exit.
			setExiting( {
				key: prevKeyRef.current + '-exit-' + Date.now(),
				content: prevChildrenRef.current,
				exitX: isBack ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
			} );

			// Start the new screen at an offset — it will animate to 0.
			setEnterX( isBack ? -SLIDE_DISTANCE : SLIDE_DISTANCE );

			// After a frame, animate to the final position.
			requestAnimationFrame( () => {
				setEnterX( 0 );
			} );
		}
		prevKeyRef.current = screenKey;
		prevChildrenRef.current = children;
	}, [ screenKey, isBack, children, prefersReducedMotion ] );

	return (
		<>
			{ exiting && (
				<motion.div
					key={ exiting.key }
					className="dashboard-sidebar-screen"
					initial={ { x: 0, opacity: 1 } }
					animate={ { x: exiting.exitX, opacity: 0 } }
					transition={ transition }
					onAnimationComplete={ () => setExiting( null ) }
					style={ { position: 'absolute', inset: 0, zIndex: 0 } }
				>
					{ exiting.content }
				</motion.div>
			) }
			<motion.div
				key={ screenKey }
				className="dashboard-sidebar-screen"
				animate={ {
					x: enterX ?? 0,
					opacity: enterX === null || enterX === 0 ? 1 : 0,
				} }
				transition={ enterX !== null && enterX !== 0 ? { duration: 0 } : transition }
				style={ { position: 'relative', zIndex: 1 } }
			>
				{ children }
			</motion.div>
		</>
	);
}
