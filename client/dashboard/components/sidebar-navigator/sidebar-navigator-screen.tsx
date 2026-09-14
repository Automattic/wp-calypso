import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
} from '@wordpress/components';
import { usePrevious, useReducedMotion } from '@wordpress/compose';
import { isRTL } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useSidebarNavigator } from './context';

const SLIDE_DISTANCE = 100;

const transition = {
	x: { duration: 0.3, ease: [ 0.33, 0, 0, 1 ] as number[] },
	opacity: { duration: 0.15 },
};

export interface ScreenProps {
	path: string;
	children: React.ReactNode;
}

/**
 * A sidebar screen that lazily renders its children only when active.
 * Animates in with slide + fade when it becomes active.
 *
 * Must be a direct child of `SidebarNavigator`.
 */
export default function SidebarNavigatorScreen( { path, children }: ScreenProps ) {
	const { activePath, isBack } = useSidebarNavigator();
	const prefersReducedMotion = useReducedMotion();
	const wrapperRef = useRef< HTMLDivElement >( null );
	const isMounted = useRef( false );
	const isActive = activePath === path;
	const wasActive = usePrevious( isActive );
	const justBecameActive = isActive && ! wasActive;
	const shouldAnimate = isMounted.current && justBecameActive && ! prefersReducedMotion;

	// Compute slide direction, respecting RTL.
	const rtl = isRTL();
	const forward = ( rtl && isBack ) || ( ! rtl && ! isBack );
	const enterX = forward ? SLIDE_DISTANCE : -SLIDE_DISTANCE;

	useEffect( () => {
		isMounted.current = true;
	}, [] );

	if ( ! isActive ) {
		return null;
	}

	return (
		<motion.div
			ref={ wrapperRef }
			className="dashboard-sidebar-navigator__screen"
			tabIndex={ -1 }
			initial={ shouldAnimate ? { x: enterX, opacity: 0 } : false }
			animate={ { x: 0, opacity: 1 } }
			transition={ transition }
		>
			{ children }
		</motion.div>
	);
}
