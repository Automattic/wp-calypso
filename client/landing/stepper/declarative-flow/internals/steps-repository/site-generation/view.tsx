import { BigSkyLogo, WordPressWordmark } from '@automattic/components';
import { Button, Icon, Notice } from '@wordpress/components';
import { check, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { BuildVisualization } from './build-visualization';
import type { SiteGenerationState } from './use-site-generation';
import type { CSSProperties } from 'react';

const WordPressMark = () => <Icon className="site-generation__wordpress-mark" icon={ wordpress } />;

const CheckmarkIcon = (
	<Icon aria-hidden="true" className="site-build-progress__check" icon={ check } size={ 12 } />
);

function ActiveIndicator() {
	return <span className="site-build-progress__activity" />;
}

// OKLCH hues the canvas can be tinted with. The first one matches the default
// blue accent, so it is only reachable once the canvas is already tinted.
const CANVAS_TINT_HUES = [ 272, 300, 340, 25, 150, 190, 230 ];
const DEFAULT_CANVAS_HUE = CANVAS_TINT_HUES[ 0 ];

// A tint holds, then drifts back to the default palette unless tapped again.
export const TINT_HOLD_MS = 2000;
// Keep in sync with the fading tint duration in style.scss.
export const TINT_FADE_MS = 4000;

type CanvasTint = {
	hue: number | null;
	// Whatever the reveal layer showed when the last tap landed, so the base
	// under the next circle matches the screen even mid-fade.
	baseColor: string | null;
	isFading: boolean;
	revealKey: number;
};

const UNTINTED: CanvasTint = { hue: null, baseColor: null, isFading: false, revealKey: 0 };

function useCanvasTint() {
	const [ tint, setTint ] = useState< CanvasTint >( UNTINTED );
	const layerRef = useRef< HTMLSpanElement >( null );
	const timeoutsRef = useRef< number[] >( [] );

	useEffect( () => () => timeoutsRef.current.forEach( window.clearTimeout ), [] );

	const cycleTint = () => {
		const currentHue = tint.hue ?? DEFAULT_CANVAS_HUE;
		const candidates = CANVAS_TINT_HUES.filter( ( hue ) => hue !== currentHue );
		const baseColor = layerRef.current
			? window.getComputedStyle( layerRef.current ).backgroundColor
			: '';
		const revealKey = tint.revealKey + 1;

		timeoutsRef.current.forEach( window.clearTimeout );
		setTint( {
			hue: candidates[ Math.floor( Math.random() * candidates.length ) ],
			baseColor: baseColor || null,
			isFading: false,
			revealKey,
		} );
		timeoutsRef.current = [
			window.setTimeout(
				() => setTint( ( current ) => ( { ...current, isFading: true } ) ),
				TINT_HOLD_MS
			),
			window.setTimeout( () => setTint( { ...UNTINTED, revealKey } ), TINT_HOLD_MS + TINT_FADE_MS ),
		];
	};

	return { ...tint, layerRef, cycleTint };
}

function getElapsedDuration( startedAt: number, now: number ) {
	const totalSeconds = Math.max( 0, Math.floor( ( now - startedAt ) / 1000 ) );
	return {
		minutes: Math.floor( totalSeconds / 60 ),
		seconds: totalSeconds % 60,
	};
}

function ElapsedTime( { startedAt }: { startedAt: number } ) {
	const translate = useTranslate();
	const [ now, setNow ] = useState( Date.now() );

	useEffect( () => {
		setNow( Date.now() );
		const interval = window.setInterval( () => setNow( Date.now() ), 1000 );

		return () => window.clearInterval( interval );
	}, [ startedAt ] );

	const { minutes, seconds } = getElapsedDuration( startedAt, now );
	const elapsedTime =
		minutes > 0
			? translate( '%(minutes)dm %(seconds)ds', {
					args: { minutes, seconds },
					comment: 'Short elapsed duration. “m” means minutes and “s” means seconds.',
			  } )
			: translate( '%(seconds)ds', {
					args: { seconds },
					comment: 'Short elapsed duration. “s” means seconds.',
			  } );
	const elapsedTimeLabel = translate( 'Elapsed time: %(elapsedTime)s', {
		args: { elapsedTime: String( elapsedTime ) },
	} );

	return (
		<span
			aria-label={ String( elapsedTimeLabel ) }
			aria-live="off"
			className="site-build-progress__elapsed"
		>
			{ elapsedTime }
		</span>
	);
}

function WaitingCanvas( { onPreviewTap }: { onPreviewTap: () => void } ) {
	const translate = useTranslate();

	return (
		<div className="site-generation__waiting">
			<BuildVisualization onTap={ onPreviewTap } />
			<div className="site-generation__waiting-copy">
				<h1 className="site-generation__waiting-title">
					{ translate( 'All good things are worth the wait' ) }
				</h1>
				<p className="site-generation__waiting-description">
					{ translate(
						'This can take up to 10 minutes. No worries, you’ll receive an email when the site is ready.'
					) }
				</p>
			</div>
		</div>
	);
}

function ErrorCanvas( { state, onReload }: { state: SiteGenerationState; onReload: () => void } ) {
	const translate = useTranslate();
	const failureReason = state.failureReason ?? 'missing-parameters';

	let title = translate( 'We couldn’t check your site' );
	let description = translate( 'The site or editor destination is missing from this page.' );
	let actionLabel = translate( 'Reload' );

	if ( failureReason === 'timed-out' || failureReason === 'build-failed' ) {
		title = translate( 'This is taking longer than expected' );
		description = translate( 'Your brief is saved.' );
		actionLabel = translate( 'Check again' );
	}

	// A server-failed build renders the server's copy verbatim; the timed-out
	// copy above stays as the fallback when the ui block omitted it.
	if ( failureReason === 'build-failed' ) {
		title = state.failureLabel ?? title;
		description = state.failureDetail ?? description;
	}

	const action = state.retryBuild
		? { label: translate( 'Start again' ), onClick: state.retryBuild }
		: { label: actionLabel, onClick: onReload };

	return (
		<div aria-live="polite" className="site-generation__outcome" role="status">
			<div className="site-generation__outcome-icon" aria-hidden="true">
				<WordPressMark />
			</div>
			<h1 className="site-generation__outcome-title">{ title }</h1>
			<p className="site-generation__outcome-description">{ description }</p>
			<div className="site-generation__outcome-actions">
				<Button
					disabled={ state.isRetryingBuild }
					isBusy={ state.isRetryingBuild }
					onClick={ action.onClick }
					variant="primary"
				>
					{ action.label }
				</Button>
			</div>
		</div>
	);
}

function BuildProgress( { state }: { state: SiteGenerationState } ) {
	const translate = useTranslate();
	const hasFailed = state.status === 'failed';
	// Every step is rendered up front, so the list itself never changes text as
	// progress advances. This carries the announcement instead.
	const activeStep = state.steps.find( ( step ) => step.status === 'active' );

	return (
		<div className="site-build-progress">
			<div className="site-build-progress__header">
				<span className="site-build-progress__title" id="site-generation-progress-title">
					{ translate( 'Follow my progress:' ) }
				</span>
			</div>
			<p className="site-build-progress__announcement" role="status">
				{ ! hasFailed && activeStep?.label }
			</p>
			<ul aria-labelledby="site-generation-progress-title" className="site-build-progress__list">
				{ state.steps.map( ( item, index ) => {
					const nextStepStatus = state.steps[ index + 1 ]?.status;
					const nextStepIsReached = nextStepStatus === 'done' || nextStepStatus === 'active';
					return (
						<li
							aria-current={ item.status === 'active' ? 'step' : undefined }
							className={ `site-build-progress__item site-build-progress__item--${ item.status }` }
							data-last={ index === state.steps.length - 1 }
							data-next-reached={ nextStepIsReached }
							key={ item.id }
						>
							<div
								aria-hidden="true"
								className={ `site-build-progress__indicator site-build-progress__indicator--${ item.status }` }
							>
								{ item.status === 'done' && CheckmarkIcon }
								{ item.status === 'active' && ! hasFailed && <ActiveIndicator /> }
							</div>
							<span className="site-build-progress__text">{ item.label }</span>
							{ item.status === 'active' && ! hasFailed && item.startedAt !== undefined && (
								<ElapsedTime startedAt={ item.startedAt } />
							) }
						</li>
					);
				} ) }
			</ul>
			{ hasFailed && (
				<Notice className="site-generation__sidebar-notice" isDismissible={ false } status="info">
					<div className="site-generation__sidebar-notice-content">
						<strong>{ translate( 'Your brief is saved' ) }</strong>
						<span className="site-generation__sidebar-notice-detail">
							{ translate( 'You can safely check its status again.' ) }
						</span>
					</div>
				</Notice>
			) }
		</div>
	);
}

export function SiteGenerationView( {
	state,
	onReload,
}: {
	state: SiteGenerationState;
	onReload: () => void;
} ) {
	const translate = useTranslate();
	const { hue, baseColor, isFading, revealKey, layerRef, cycleTint } = useCanvasTint();
	const tintStyle = {
		'--site-generation-hue': hue ?? undefined,
		'--site-generation-canvas-base': baseColor ?? undefined,
	} as CSSProperties;

	return (
		<main className="site-generation" data-generation-view={ state.status }>
			<section
				aria-label={ translate( 'Site generation' ) }
				className="site-generation__editor"
				data-tint-fading={ isFading }
				data-tinted={ hue !== null && ! isFading }
				style={ tintStyle }
			>
				{ hue !== null && (
					<span
						aria-hidden="true"
						className="site-generation__tint"
						key={ revealKey }
						ref={ layerRef }
					/>
				) }
				<div aria-label="WordPress.com" className="site-generation__brand" role="img">
					<WordPressWordmark className="site-generation__brand-logo" color="currentColor" />
				</div>
				<div className="site-generation__canvas">
					{ state.status === 'failed' ? (
						<ErrorCanvas state={ state } onReload={ onReload } />
					) : (
						<WaitingCanvas onPreviewTap={ cycleTint } />
					) }
				</div>
			</section>
			<aside
				aria-label={ translate( 'Site generation progress' ) }
				className="site-generation__sidebar"
			>
				<div className="site-generation__sidebar-header">
					<span aria-hidden="true" className="site-generation__assistant-icon">
						<BigSkyLogo.CentralLogo fill="currentColor" heartless size={ 48 } />
					</span>
				</div>
				<div className="site-generation__conversation">
					<p className="site-generation__conversation-message">
						{ translate( 'Hello! I’m the WordPress Agent, and I’m building your site right now.' ) }
					</p>
					<BuildProgress state={ state } />
				</div>
			</aside>
		</main>
	);
}
