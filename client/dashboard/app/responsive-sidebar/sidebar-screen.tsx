import { useReducedMotion } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useCallback, useState } from 'react';

type AnimationStatus = 'INITIAL' | 'ANIMATING_IN' | 'IN' | 'ANIMATING_OUT' | 'OUT';

const ANIMATION_DURATION = 450;
const ANIMATION_TIMEOUT_MARGIN = 1.2;

/**
 * A sidebar screen that animates in and out based on whether it's active.
 * Replaces `Navigator.Screen` without depending on `@wordpress/components` Navigator.
 */
export default function SidebarScreen( {
	isActive,
	isBack,
	skipAnimation,
	children,
}: {
	isActive: boolean;
	isBack: boolean;
	skipAnimation: boolean;
	children: React.ReactNode;
} ) {
	const prefersReducedMotion = useReducedMotion();
	const [ animationStatus, setAnimationStatus ] = useState< AnimationStatus >( 'INITIAL' );

	const becameSelected = animationStatus !== 'ANIMATING_IN' && animationStatus !== 'IN' && isActive;
	const becameUnselected =
		animationStatus !== 'ANIMATING_OUT' && animationStatus !== 'OUT' && ! isActive;

	useLayoutEffect( () => {
		if ( becameSelected ) {
			setAnimationStatus( skipAnimation || prefersReducedMotion ? 'IN' : 'ANIMATING_IN' );
		} else if ( becameUnselected ) {
			setAnimationStatus( skipAnimation || prefersReducedMotion ? 'OUT' : 'ANIMATING_OUT' );
		}
	}, [ becameSelected, becameUnselected, skipAnimation, prefersReducedMotion ] );

	// Fallback timeout in case animationend doesn't fire.
	useEffect( () => {
		let timeout: number | undefined;
		if ( animationStatus === 'ANIMATING_OUT' ) {
			timeout = window.setTimeout(
				() => setAnimationStatus( 'OUT' ),
				ANIMATION_DURATION * ANIMATION_TIMEOUT_MARGIN
			);
		} else if ( animationStatus === 'ANIMATING_IN' ) {
			timeout = window.setTimeout(
				() => setAnimationStatus( 'IN' ),
				ANIMATION_DURATION * ANIMATION_TIMEOUT_MARGIN
			);
		}
		return () => {
			if ( timeout ) {
				window.clearTimeout( timeout );
			}
		};
	}, [ animationStatus ] );

	const onAnimationEnd = useCallback( () => {
		if ( animationStatus === 'ANIMATING_OUT' ) {
			setAnimationStatus( 'OUT' );
		} else if ( animationStatus === 'ANIMATING_IN' ) {
			setAnimationStatus( 'IN' );
		}
	}, [ animationStatus ] );

	const shouldRender = isActive || animationStatus === 'IN' || animationStatus === 'ANIMATING_OUT';

	if ( ! shouldRender ) {
		return null;
	}

	const isAnimating = animationStatus === 'ANIMATING_IN' || animationStatus === 'ANIMATING_OUT';

	return (
		<div
			className={ clsx( 'dashboard-sidebar-screen', {
				'is-animating-in': animationStatus === 'ANIMATING_IN',
				'is-animating-out': animationStatus === 'ANIMATING_OUT',
				'is-back': isBack,
			} ) }
			onAnimationEnd={ isAnimating ? onAnimationEnd : undefined }
		>
			{ children }
		</div>
	);
}
