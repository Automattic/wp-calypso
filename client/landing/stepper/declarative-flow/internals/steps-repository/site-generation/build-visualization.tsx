import { Icon } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { wordpress } from '@wordpress/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

// Each layout is a block of geometry in style.scss keyed by data-layout; the
// atoms tween between them with CSS transitions. Desktop and mobile frames
// alternate so the width change reads as a different device.
export const PREVIEW_LAYOUTS = [
	{ id: 'hero-split', frame: 'desktop' },
	{ id: 'mobile-stack', frame: 'mobile' },
	{ id: 'hero-cover', frame: 'desktop' },
	{ id: 'mobile-cover', frame: 'mobile' },
	{ id: 'split-cards', frame: 'desktop' },
	{ id: 'mobile-list', frame: 'mobile' },
] as const;

export const LAYOUT_HOLD_MS = 4000;
// Keep in sync with --site-generation-morph-duration in style.scss.
export const LAYOUT_MORPH_MS = 1000;

export const MAX_TILT_DEG = 6;
export const MAX_PARALLAX_PX = 8;

// Keep in sync with the release transition duration in style.scss.
export const PRESS_RELEASE_MS = 550;

function clampUnit( value: number ) {
	return Math.max( -1, Math.min( 1, value ) );
}

// The hold restarts whenever the pointer leaves or a layout is advanced by
// hand, so an automatic morph never lands right after either.
function usePreviewLayoutCycle(
	layoutCount: number,
	isPaused: boolean,
	shouldReduceMotion: boolean
) {
	const [ index, setIndex ] = useState( 0 );
	const [ isMorphing, setIsMorphing ] = useState( false );
	const [ holdKey, setHoldKey ] = useState( 0 );
	const settleTimeoutRef = useRef< number | undefined >( undefined );

	const advance = useCallback( () => {
		setIndex( ( previous ) => ( previous + 1 ) % layoutCount );
		setIsMorphing( true );
		window.clearTimeout( settleTimeoutRef.current );
		settleTimeoutRef.current = window.setTimeout(
			() => setIsMorphing( false ),
			LAYOUT_MORPH_MS / 2
		);
	}, [ layoutCount ] );

	useEffect( () => () => window.clearTimeout( settleTimeoutRef.current ), [] );

	useEffect( () => {
		if ( layoutCount < 2 || isPaused || shouldReduceMotion ) {
			return;
		}

		const interval = window.setInterval( advance, LAYOUT_HOLD_MS + LAYOUT_MORPH_MS );

		return () => window.clearInterval( interval );
	}, [ advance, holdKey, isPaused, layoutCount, shouldReduceMotion ] );

	const advanceNow = () => {
		advance();
		setHoldKey( ( previous ) => previous + 1 );
	};

	return { index, isMorphing, advance: advanceNow };
}

// Tilts the frame toward the pointer and offsets the atoms by depth. Bringing
// the near edge toward the viewer swings the surface normal away from the
// pointer, so raised layers shift against it; the parallax offset is the
// displacement of the nearest layer and deeper ones take a fraction of it.
// The values go straight to CSS custom properties on the frame, once per
// animation frame, so pointer movement never re-renders the component.
function usePointerTilt( shouldReduceMotion: boolean ) {
	const frameRef = useRef< HTMLDivElement >( null );
	const animationFrameRef = useRef< number | undefined >( undefined );
	const pointerRef = useRef< { x: number; y: number } | null >( null );

	const applyTilt = useCallback( ( x: number, y: number ) => {
		const frame = frameRef.current;
		if ( ! frame ) {
			return;
		}
		frame.style.setProperty( '--site-generation-tilt-x', `${ y * MAX_TILT_DEG }deg` );
		frame.style.setProperty( '--site-generation-tilt-y', `${ -x * MAX_TILT_DEG }deg` );
		frame.style.setProperty( '--site-generation-parallax-x', `${ -x * MAX_PARALLAX_PX }px` );
		frame.style.setProperty( '--site-generation-parallax-y', `${ -y * MAX_PARALLAX_PX }px` );
	}, [] );

	useEffect( () => {
		if ( shouldReduceMotion ) {
			pointerRef.current = null;
			applyTilt( 0, 0 );
		}
	}, [ applyTilt, shouldReduceMotion ] );

	useEffect(
		() => () => {
			if ( animationFrameRef.current !== undefined ) {
				window.cancelAnimationFrame( animationFrameRef.current );
			}
		},
		[]
	);

	const onPointerMove = ( event: ReactPointerEvent< HTMLDivElement > ) => {
		if ( shouldReduceMotion || event.pointerType === 'touch' ) {
			return;
		}
		pointerRef.current = { x: event.clientX, y: event.clientY };
		if ( animationFrameRef.current !== undefined ) {
			return;
		}
		animationFrameRef.current = window.requestAnimationFrame( () => {
			animationFrameRef.current = undefined;
			const frame = frameRef.current;
			const pointer = pointerRef.current;
			if ( ! frame || ! pointer ) {
				return;
			}
			const rect = frame.getBoundingClientRect();
			applyTilt(
				clampUnit( ( ( pointer.x - rect.left ) / rect.width ) * 2 - 1 ),
				clampUnit( ( ( pointer.y - rect.top ) / rect.height ) * 2 - 1 )
			);
		} );
	};

	const onPointerLeave = () => {
		if ( shouldReduceMotion ) {
			return;
		}
		pointerRef.current = null;
		applyTilt( 0, 0 );
	};

	return { frameRef, onPointerMove, onPointerLeave };
}

// Pressing squeezes the frame for as long as the pointer is held; releasing
// lets it spring back. The two phases carry different transition curves in
// style.scss.
function usePressBounce( shouldReduceMotion: boolean ) {
	const [ press, setPress ] = useState< 'down' | 'up' | null >( null );
	const isDownRef = useRef( false );
	const releaseTimeoutRef = useRef< number | undefined >( undefined );

	useEffect( () => () => window.clearTimeout( releaseTimeoutRef.current ), [] );
	useEffect( () => {
		if ( shouldReduceMotion ) {
			isDownRef.current = false;
			setPress( null );
		}
	}, [ shouldReduceMotion ] );

	const pressDown = () => {
		if ( shouldReduceMotion ) {
			return;
		}
		window.clearTimeout( releaseTimeoutRef.current );
		isDownRef.current = true;
		setPress( 'down' );
	};

	const release = () => {
		if ( ! isDownRef.current ) {
			return;
		}
		isDownRef.current = false;
		setPress( 'up' );
		releaseTimeoutRef.current = window.setTimeout( () => setPress( null ), PRESS_RELEASE_MS );
	};

	return { press, pressDown, release };
}

export function BuildVisualization( { onTap }: { onTap?: () => void } ) {
	const [ isHovered, setIsHovered ] = useState( false );
	const shouldReduceMotion = useReducedMotion();
	const { index, isMorphing, advance } = usePreviewLayoutCycle(
		PREVIEW_LAYOUTS.length,
		isHovered,
		shouldReduceMotion
	);
	const { frameRef, onPointerMove, onPointerLeave } = usePointerTilt( shouldReduceMotion );
	const { press, pressDown, release } = usePressBounce( shouldReduceMotion );
	const layout = PREVIEW_LAYOUTS[ index ];

	return (
		<div className="site-generation__build-visual" aria-hidden="true">
			<div
				className="site-generation__page-preview"
				data-frame={ layout.frame }
				data-layout={ layout.id }
				data-morphing={ isMorphing }
				data-press={ press ?? undefined }
				onPointerCancel={ release }
				onPointerDown={ ( event ) => {
					if ( ! ( event.button > 0 ) ) {
						pressDown();
					}
				} }
				onPointerEnter={ () => setIsHovered( true ) }
				onPointerLeave={ () => {
					setIsHovered( false );
					release();
					onPointerLeave();
				} }
				onPointerMove={ onPointerMove }
				onPointerUp={ ( event ) => {
					if ( ! ( event.button > 0 ) ) {
						release();
						advance();
						onTap?.();
					}
				} }
				ref={ frameRef }
			>
				<div className="site-generation__preview-bar">
					<Icon className="site-generation__wordpress-mark" icon={ wordpress } />
					<div className="site-generation__preview-nav">
						<span className="site-generation__preview-nav-item" />
						<span className="site-generation__preview-nav-item is-secondary" />
						<span className="site-generation__preview-nav-item is-secondary" />
					</div>
				</div>
				<div className="site-generation__preview-media" />
				<span className="site-generation__preview-line is-eyebrow" />
				<span className="site-generation__preview-line is-heading" />
				<span className="site-generation__preview-line is-subheading" />
				<span className="site-generation__preview-line is-copy" />
				<span className="site-generation__preview-line is-copy-short" />
				<span className="site-generation__preview-line is-button" />
				<span className="site-generation__preview-card is-first" />
				<span className="site-generation__preview-card is-second" />
				<span className="site-generation__preview-card is-third" />
			</div>
		</div>
	);
}
