import { Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLayoutEffect, useRef, useState } from 'react';
import { severityFor } from './score-severity';
import type { AmplifyMode } from '@automattic/api-core';

type ScoreMetric = {
	label: string;
	description: string;
	score: number;
	max: number;
};

type ScorePerspective = {
	type: 'human' | 'ai';
	label: string;
	title: string;
	description: string;
	score: number;
	metrics: ScoreMetric[];
};

// Example results from a real report, with the current weighted rubric categories.
export const PERSPECTIVES: Record< 'human' | 'ai', ScorePerspective > = {
	human: {
		type: 'human',
		label: __( 'First-time visitors' ),
		title: __( 'How people judge a site' ),
		description: __(
			'New visitors decide if a business is trustworthy in seconds. We check if the homepage proactively answers visitors’ questions and earns their trust.'
		),
		score: 46,
		metrics: [
			{
				label: __( 'Trust Signals' ),
				description: __(
					'Does the site give a first-time visitor enough evidence to feel confident getting in touch?'
				),
				score: 4,
				max: 18,
			},
			{
				label: __( 'Contact & Conversion' ),
				description: __(
					'When someone is ready to reach out, does the site make that easy, or create friction at the worst possible moment?'
				),
				score: 3,
				max: 17,
			},
			{
				label: __( 'SEO' ),
				description: __(
					'Can people find this site when they search? All signals are sourced from Google Search Central documentation.'
				),
				score: 5,
				max: 11,
			},
			{
				label: __( 'Mobile Experience' ),
				description: __(
					'A first impression often happens on a phone. Does the site hold up there?'
				),
				score: 7,
				max: 12,
			},
			{
				label: __( 'Content Quality' ),
				description: __(
					'Is the writing compelling, clear, and professional? Errors and poor readability erode trust before a visitor has read a single sentence.'
				),
				score: 11,
				max: 12,
			},
			{
				label: __( 'Design & Experience' ),
				description: __(
					'Does the site look credible and feel effortless to use? All signals are grounded in the Laws of UX.'
				),
				score: 5,
				max: 10,
			},
			{
				label: __( 'Accessibility' ),
				description: __(
					'Does the site work for everyone? We check key accessibility signals like contrast, text alternatives, and labels. It isn’t a full WCAG conformance audit.'
				),
				score: 8,
				max: 10,
			},
			{
				label: __( 'Audience Resonance' ),
				description: __(
					'Does the site feel made for the right audience? Within seconds of landing, visitors should feel the site is speaking directly to them.'
				),
				score: 3,
				max: 10,
			},
		],
	},
	ai: {
		type: 'ai',
		label: __( 'AI agents' ),
		title: __( 'How AI interprets a site' ),
		description: __(
			'More and more people use AI to find businesses online. We check whether tools like ChatGPT can understand the business and recommend it.'
		),
		score: 50,
		metrics: [
			{
				label: __( 'Technical Health' ),
				description: __(
					'Can AI tools access, crawl, and render the site? If a crawler cannot reach the content, nothing else matters.'
				),
				score: 18,
				max: 20,
			},
			{
				label: __( 'Structured Data' ),
				description: __(
					'Schema markup tells AI tools exactly what the site is about rather than making them infer it. The difference between an AI accurately describing the business and producing a generic summary.'
				),
				score: 3,
				max: 18,
			},
			{
				label: __( 'AEO Readiness' ),
				description: __(
					'Answer Engine Optimization. Is the content structured to surface in AI-generated answers? AI tools prioritize pages that answer questions directly, not pages that bury key information.'
				),
				score: 3,
				max: 16,
			},
			{
				label: __( 'E-E-A-T Signals' ),
				description: __(
					"Experience, Expertise, Authoritativeness, Trustworthiness. Google's quality framework and the backbone of how AI tools evaluate whether a source is worth citing."
				),
				score: 9,
				max: 14,
			},
			{
				label: __( 'Content Freshness' ),
				description: __(
					'Is the content up to date? AI tools and search engines both treat stale content as a signal of lower reliability.'
				),
				score: 7,
				max: 12,
			},
			{
				label: __( 'Entity Clarity' ),
				description: __(
					'Does the site make it unambiguous who this business is? AI knowledge graphs depend on clear, consistent entity signals across the web.'
				),
				score: 7,
				max: 10,
			},
			{
				label: __( 'Content Specificity' ),
				description: __(
					'Does the content say something specific, or could it describe any business in the same category? Generic content is the most common reason AI tools skip a site when generating recommendations.'
				),
				score: 3,
				max: 7,
			},
			{
				label: __( 'llms.txt' ),
				description: __(
					'An emerging standard that lets businesses publish a machine-readable summary of their site specifically for large language models.'
				),
				score: 0,
				max: 3,
			},
		],
	},
};

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

function ScoreCard( {
	perspective,
	isHidden,
	isExpanded,
}: {
	perspective: ScorePerspective;
	isHidden: boolean;
	isExpanded: boolean;
} ) {
	return (
		<div className="dashboard-amplify-score-preview__card">
			<div className="dashboard-amplify-score-preview__card-header">
				<ScoreIllustration type={ perspective.type } />
				<div className="dashboard-amplify-score-preview__card-title">
					<div className="dashboard-amplify-score-preview__card-heading">
						<span className="dashboard-amplify-score-preview__label">{ perspective.label }</span>
						<h4 className="dashboard-amplify-score-preview__heading">{ perspective.title }</h4>
					</div>
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
						{ isExpanded && ! isHidden ? (
							<Tooltip
								className="dashboard-amplify-score-preview__metric-tooltip"
								text={ metric.description }
								delay={ 200 }
							>
								<button type="button" onPointerUp={ ( event ) => event.stopPropagation() }>
									{ metric.label }
								</button>
							</Tooltip>
						) : (
							<span>{ metric.label }</span>
						) }
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
	const humanSheet = useRef< HTMLDivElement >( null );
	const aiSheet = useRef< HTMLDivElement >( null );
	const activeShuffle = useRef< {
		from: 'human' | 'ai';
		to: 'human' | 'ai';
		target: 'human' | 'ai';
		animations: Animation[];
	} | null >( null );
	useLayoutEffect( () => {
		if ( ! isExpanded ) {
			return;
		}
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				setIsExpanded( false );
			}
		};
		window.addEventListener( 'keydown', handleKeyDown );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ isExpanded ] );

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

	const toggle = () => {
		activeShuffle.current?.animations.forEach( ( animation ) => animation.cancel() );
		activeShuffle.current = null;
		setDisplayMode( mode );
		setIsExpanded( ( expanded ) => ! expanded );
	};

	return (
		<div
			className="dashboard-amplify-score-preview__anchor"
			data-mode={ displayMode }
			data-expanded={ isExpanded }
		>
			<div
				className="dashboard-amplify-score-preview__cards"
				data-mode={ displayMode }
				data-expanded={ isExpanded }
				onPointerUp={ toggle }
			>
				<div
					ref={ humanSheet }
					className="dashboard-amplify-score-preview__sheet"
					data-perspective="human"
					aria-hidden={ ! isExpanded && mode === 'ai' }
				>
					<ScoreCard
						perspective={ PERSPECTIVES.human }
						isHidden={ ! isExpanded && mode === 'ai' }
						isExpanded={ isExpanded }
					/>
				</div>
				<div
					ref={ aiSheet }
					className="dashboard-amplify-score-preview__sheet"
					data-perspective="ai"
					aria-hidden={ ! isExpanded && mode === 'human' }
				>
					<ScoreCard
						perspective={ PERSPECTIVES.ai }
						isHidden={ ! isExpanded && mode === 'human' }
						isExpanded={ isExpanded }
					/>
				</div>
				<button
					type="button"
					className="dashboard-amplify-score-preview__open"
					aria-label={
						isExpanded ? __( 'Collapse sample report scores' ) : __( 'Expand sample report scores' )
					}
					aria-expanded={ isExpanded }
					onClick={ toggle }
				/>
			</div>
		</div>
	);
}
