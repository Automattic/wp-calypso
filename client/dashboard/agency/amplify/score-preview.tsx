import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { AmplifyMode } from '@automattic/api-core';
import type { CSSProperties } from 'react';

type ScoreMetric = {
	label: string;
	score: number;
	max: number;
};

type ScorePerspective = {
	type: 'human' | 'ai';
	label: string;
	description: string;
	score: number;
	metrics: ScoreMetric[];
};

// Example results from a real report, with the current weighted rubric categories.
const PERSPECTIVES: Record< 'human' | 'ai', ScorePerspective > = {
	human: {
		type: 'human',
		label: __( 'First-time visitors' ),
		description: __( 'Actionable advice for each category to help new visitors feel at home.' ),
		score: 46,
		metrics: [
			{ label: __( 'Trust Signals' ), score: 4, max: 18 },
			{ label: __( 'Contact & Conversion' ), score: 3, max: 17 },
			{ label: __( 'SEO' ), score: 5, max: 11 },
			{ label: __( 'Mobile Experience' ), score: 7, max: 12 },
			{ label: __( 'Content Quality' ), score: 11, max: 12 },
			{ label: __( 'Design & Experience' ), score: 5, max: 10 },
			{ label: __( 'Accessibility' ), score: 8, max: 10 },
			{ label: __( 'Audience Resonance' ), score: 3, max: 10 },
		],
	},
	ai: {
		type: 'ai',
		label: __( 'AI systems' ),
		description: __(
			'Actionable advice for each category to help AI systems understand your site.'
		),
		score: 50,
		metrics: [
			{ label: __( 'Technical Health' ), score: 18, max: 20 },
			{ label: __( 'Structured Data' ), score: 3, max: 18 },
			{ label: __( 'AEO Readiness' ), score: 3, max: 16 },
			{ label: __( 'E-E-A-T Signals' ), score: 9, max: 14 },
			{ label: __( 'Content Freshness' ), score: 7, max: 12 },
			{ label: __( 'Entity Clarity' ), score: 7, max: 10 },
			{ label: __( 'Content Specificity' ), score: 3, max: 7 },
			{ label: __( 'llms.txt' ), score: 0, max: 3 },
		],
	},
};

function severityFor( score: number, max: number ) {
	const percentage = ( score / max ) * 100;
	if ( percentage >= 80 ) {
		return 'good';
	}
	if ( percentage >= 50 ) {
		return 'warn';
	}
	return 'danger';
}

function ScoreIllustration( { type }: { type: ScorePerspective[ 'type' ] } ) {
	return (
		<svg
			className="dashboard-amplify-score-preview__illustration"
			viewBox="0 0 48 48"
			fill="none"
			aria-hidden="true"
		>
			{ type === 'human' ? (
				<>
					<rect x="5" y="8" width="38" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M5 16H43M12 28C15.5 23.5 19.5 21.5 24 21.5S32.5 23.5 36 28C32.5 32.5 28.5 34.5 24 34.5S15.5 32.5 12 28Z"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<circle cx="10" cy="12" r="1" fill="currentColor" />
					<circle cx="14" cy="12" r="1" fill="currentColor" />
					<circle cx="24" cy="28" r="3" stroke="currentColor" strokeWidth="1.5" />
				</>
			) : (
				<>
					<path d="M24 12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<circle cx="24" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
					<rect
						x="7"
						y="13"
						width="34"
						height="29"
						rx="6"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<path
						d="M7 23H4V32H7M41 23H44V32H41"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinejoin="round"
					/>
					<circle cx="17" cy="26" r="2.5" fill="currentColor" />
					<circle cx="31" cy="26" r="2.5" fill="currentColor" />
					<path d="M18 35H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
				</>
			) }
		</svg>
	);
}

function ScoreCard( { perspective }: { perspective: ScorePerspective } ) {
	return (
		<div className="dashboard-amplify-score-preview__card">
			<div className="dashboard-amplify-score-preview__card-header">
				<ScoreIllustration type={ perspective.type } />
				<div className="dashboard-amplify-score-preview__card-title">
					<h4 className="dashboard-amplify-score-preview__heading">{ perspective.label }</h4>
					<p>{ perspective.description }</p>
				</div>
				<strong
					className="dashboard-amplify-score-preview__score"
					data-severity={ severityFor( perspective.score, 100 ) }
				>
					{ perspective.score }/100
				</strong>
			</div>
			<div className="dashboard-amplify-score-preview__metrics">
				{ perspective.metrics.map( ( metric ) => (
					<div className="dashboard-amplify-score-preview__metric" key={ metric.label }>
						<span>{ metric.label }</span>
						<div className="dashboard-amplify-score-preview__bar" aria-hidden="true">
							<span
								data-severity={ severityFor( metric.score, metric.max ) }
								style={ { inlineSize: `${ ( metric.score / metric.max ) * 100 }%` } }
							/>
						</div>
						<strong data-severity={ severityFor( metric.score, metric.max ) }>
							{ metric.score }/{ metric.max }
						</strong>
					</div>
				) ) }
			</div>
		</div>
	);
}

export default function AmplifyScorePreview( { mode }: { mode: AmplifyMode } ) {
	const [ displayMode, setDisplayMode ] = useState( mode );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isReturning, setIsReturning ] = useState( false );
	const [ anchorRect, setAnchorRect ] = useState( { left: 0, top: 0, width: 0, height: 0 } );
	const [ viewport, setViewport ] = useState( { width: 0, height: 0 } );
	const anchor = useRef< HTMLDivElement >( null );
	const openButton = useRef< HTMLButtonElement >( null );
	const closeButton = useRef< HTMLButtonElement >( null );
	const hasOpened = useRef( false );
	const humanSheet = useRef< HTMLDivElement >( null );
	const aiSheet = useRef< HTMLDivElement >( null );
	const activeShuffle = useRef< {
		from: 'human' | 'ai';
		to: 'human' | 'ai';
		target: 'human' | 'ai';
		animations: Animation[];
	} | null >( null );
	const close = useCallback( () => {
		setIsExpanded( false );
		setIsReturning( ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
	}, [] );

	useLayoutEffect( () => {
		const update = () => {
			const rect = anchor.current?.getBoundingClientRect();
			if ( ! rect ) {
				return;
			}
			setAnchorRect( ( previous ) =>
				previous.left === rect.left &&
				previous.top === rect.top &&
				previous.width === rect.width &&
				previous.height === rect.height
					? previous
					: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
			);
			setViewport( ( previous ) =>
				previous.width === window.innerWidth && previous.height === window.innerHeight
					? previous
					: { width: window.innerWidth, height: window.innerHeight }
			);
		};
		update();
		const observer = new ResizeObserver( update );
		if ( anchor.current ) {
			observer.observe( anchor.current );
		}
		window.addEventListener( 'resize', update );
		window.addEventListener( 'scroll', update, true );
		return () => {
			observer.disconnect();
			window.removeEventListener( 'resize', update );
			window.removeEventListener( 'scroll', update, true );
		};
	}, [ displayMode ] );

	useLayoutEffect( () => {
		if ( ! isExpanded && ! isReturning ) {
			if ( hasOpened.current ) {
				openButton.current?.focus();
			}
			return;
		}
		if ( isExpanded ) {
			hasOpened.current = true;
			closeButton.current?.focus();
		}
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' && isExpanded ) {
				close();
			} else if ( event.key === 'Tab' && isExpanded ) {
				event.preventDefault();
				closeButton.current?.focus();
			}
		};
		window.addEventListener( 'keydown', handleKeyDown );
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ close, isExpanded, isReturning ] );

	useLayoutEffect( () => {
		if ( ! isReturning ) {
			return;
		}
		const timer = window.setTimeout( () => setIsReturning( false ), 420 );
		return () => window.clearTimeout( timer );
	}, [ isReturning ] );

	useLayoutEffect( () => {
		const active = activeShuffle.current;
		if ( active ) {
			if ( mode === 'full' ) {
				active.animations.forEach( ( animation ) => animation.cancel() );
				activeShuffle.current = null;
				setDisplayMode( mode );
			} else if ( active.target !== mode ) {
				active.animations.forEach( ( animation ) => animation.reverse() );
				active.target = mode;
			}
			return;
		}

		if ( displayMode === mode ) {
			return;
		}
		if (
			displayMode === 'full' ||
			mode === 'full' ||
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ||
			! humanSheet.current ||
			! aiSheet.current
		) {
			setDisplayMode( mode );
			return;
		}

		const frontKeyframes: Keyframe[] = [
			{ offset: 0, zIndex: 2, transform: 'translateX(-50%) rotate(-1deg)' },
			{ offset: 0.495, zIndex: 2, transform: 'translate(-16px, 6px) scale(0.94)' },
			{ offset: 0.505, zIndex: 1, transform: 'translate(-16px, 6px) scale(0.94)' },
			{ offset: 1, zIndex: 1, transform: 'translate(calc(-50% + 26px), -10px) rotate(2deg)' },
		];
		const backKeyframes: Keyframe[] = [
			{ offset: 0, zIndex: 1, transform: 'translate(calc(-50% + 26px), -10px) rotate(2deg)' },
			{ offset: 0.495, zIndex: 1, transform: 'translate(calc(-100% + 16px), -6px) scale(0.94)' },
			{ offset: 0.505, zIndex: 2, transform: 'translate(calc(-100% + 16px), -6px) scale(0.94)' },
			{ offset: 1, zIndex: 2, transform: 'translateX(-50%) rotate(-1deg)' },
		];
		const options: KeyframeAnimationOptions = {
			duration: 700,
			easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
			fill: 'both',
		};
		const front = displayMode === 'human' ? humanSheet.current : aiSheet.current;
		const back = displayMode === 'human' ? aiSheet.current : humanSheet.current;
		const animations = [
			front.animate( frontKeyframes, options ),
			back.animate( backKeyframes, options ),
		];
		const shuffle = {
			from: displayMode,
			to: mode,
			target: mode,
			animations,
		};
		activeShuffle.current = shuffle;
		animations[ 0 ].onfinish = () => {
			if ( activeShuffle.current !== shuffle ) {
				return;
			}
			activeShuffle.current = null;
			setDisplayMode( shuffle.target );
			requestAnimationFrame( () => animations.forEach( ( animation ) => animation.cancel() ) );
		};
	}, [ displayMode, mode ] );

	useLayoutEffect( () => {
		return () => activeShuffle.current?.animations.forEach( ( animation ) => animation.cancel() );
	}, [] );

	const isTwoColumns = viewport.width >= 1240;
	const expandedScale = isTwoColumns
		? Math.min( 1.25, ( viewport.width - 104 ) / 1080, ( viewport.height - 80 ) / 340 )
		: Math.min( 1.2, ( viewport.width - 48 ) / 540, ( viewport.height - 104 ) / 680 );
	const cardScale = Math.max( 0.35, expandedScale );
	const offset = ( ( isTwoColumns ? 540 : 340 ) * cardScale ) / 2 + 12;
	const humanFirst = mode !== 'ai';
	const firstOffset = humanFirst ? -offset : offset;
	const secondOffset = -firstOffset;
	const cardsStyle = {
		left: isExpanded ? 0 : anchorRect.left,
		top: isExpanded ? 0 : anchorRect.top,
		width: isExpanded ? '100vw' : anchorRect.width,
		height: isExpanded ? '100dvh' : anchorRect.height,
		'--score-expanded-scale': cardScale,
		'--score-human-x': `${ isTwoColumns ? firstOffset : 0 }px`,
		'--score-ai-x': `${ isTwoColumns ? secondOffset : 0 }px`,
		'--score-human-y': `${ isTwoColumns ? 0 : firstOffset }px`,
		'--score-ai-y': `${ isTwoColumns ? 0 : secondOffset }px`,
	} as CSSProperties;
	const open = () => {
		activeShuffle.current?.animations.forEach( ( animation ) => animation.cancel() );
		activeShuffle.current = null;
		setDisplayMode( mode );
		setIsReturning( false );
		setIsExpanded( true );
	};

	return (
		<>
			<div
				ref={ anchor }
				className="dashboard-amplify-score-preview__anchor"
				data-mode={ displayMode }
			/>
			{ anchorRect.width > 0 && (
				<div
					className="dashboard-amplify-score-preview__cards"
					data-mode={ displayMode }
					data-expanded={ isExpanded }
					data-overlay={ isExpanded || isReturning }
					style={ cardsStyle }
					role={ isExpanded ? 'dialog' : undefined }
					aria-modal={ isExpanded ? 'true' : undefined }
					aria-label={ isExpanded ? __( 'Sample report scores' ) : undefined }
				>
					<button
						type="button"
						className="dashboard-amplify-score-preview__scrim"
						aria-label={ __( 'Close sample report scores' ) }
						tabIndex={ isExpanded ? 0 : -1 }
						onClick={ close }
					/>
					<div
						ref={ humanSheet }
						className="dashboard-amplify-score-preview__sheet"
						data-perspective="human"
						aria-hidden={ ! isExpanded && mode === 'ai' }
					>
						<ScoreCard perspective={ PERSPECTIVES.human } />
					</div>
					<div
						ref={ aiSheet }
						className="dashboard-amplify-score-preview__sheet"
						data-perspective="ai"
						aria-hidden={ ! isExpanded && mode === 'human' }
					>
						<ScoreCard perspective={ PERSPECTIVES.ai } />
					</div>
					<button
						type="button"
						className="dashboard-amplify-score-preview__open"
						aria-label={ __( 'View full sample report scores' ) }
						ref={ openButton }
						onClick={ open }
					/>
					<Button
						ref={ closeButton }
						className="dashboard-amplify-score-preview__close"
						variant="tertiary"
						icon={ closeSmall }
						label={ __( 'Close sample report scores' ) }
						tabIndex={ isExpanded ? 0 : -1 }
						onClick={ close }
					/>
				</div>
			) }
		</>
	);
}
