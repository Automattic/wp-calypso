import { WordPressWordmark } from '@automattic/components';
import { sparkles } from '@automattic/components/src/icons';
import { Button, Icon, Notice } from '@wordpress/components';
import { check, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import type { LiveBuildSection, LiveBuildState } from './build-feed-state';
import type { SiteGenerationState } from './use-site-generation';
import type { CSSProperties } from 'react';

const WordPressMark = () => <Icon className="site-generation__wordpress-mark" icon={ wordpress } />;

const CheckmarkIcon = (
	<Icon aria-hidden="true" className="site-build-progress__check" icon={ check } size={ 12 } />
);

function ActiveIndicator() {
	return <span className="site-build-progress__activity" />;
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

// Pick a palette color by slug intent, with positional fallbacks, so the mock
// repaints from whatever the generated theme.json actually named its colors.
function pickColor(
	colors: LiveBuildState[ 'colors' ],
	intents: string[],
	fallbackIndex: number
): string | undefined {
	if ( ! colors?.length ) {
		return undefined;
	}
	for ( const intent of intents ) {
		const match = colors.find( ( entry ) => entry.slug?.includes( intent ) );
		if ( match ) {
			return match.color;
		}
	}
	return colors[ fallbackIndex ]?.color;
}

// Load real font previews for the generated pairing. The families come from
// the vendored Google Fonts catalog server-side, so the CSS2 API resolves
// them; the theme itself bundles its own font files later — this link is a
// waiting-screen preview only, removed on unmount.
function useFontPreview( families: string[] ) {
	const key = families.join( '|' );
	useEffect( () => {
		if ( ! key ) {
			return;
		}
		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = `https://fonts.googleapis.com/css2?${ key
			.split( '|' )
			.map( ( family ) => `family=${ encodeURIComponent( family ) }:wght@400;600` )
			.join( '&' ) }&display=swap`;
		document.head.appendChild( link );
		return () => {
			link.remove();
		};
	}, [ key ] );
}

function heroSectionOf( live: LiveBuildState, pageSlug?: string ): LiveBuildSection | undefined {
	const sections = Object.values( live.sections ).filter( ( entry ) => entry.part === 'section' );
	if ( ! sections.length ) {
		return undefined;
	}
	const ofPage = pageSlug ? sections.filter( ( entry ) => entry.page === pageSlug ) : sections;
	const pool = ofPage.length ? ofPage : sections;
	// The plan-key order is generation order, hero first within its page.
	const byPlan = live.planKeys
		?.map( ( key ) => pool.find( ( entry ) => entry.key === key ) )
		.find( Boolean );
	return byPlan ?? pool[ 0 ];
}

function BuildVisualization( { live }: { live: LiveBuildState } ) {
	const colors = live.colors;
	const background = pickColor( colors, [ 'base', 'background' ], 0 );
	const foreground = pickColor( colors, [ 'contrast', 'foreground' ], 1 );
	const accent = pickColor( colors, [ 'accent', 'primary' ], 2 ) ?? live.design?.palette?.[ 0 ];

	const headingFamily =
		live.fonts?.find( ( font ) => font.slug?.includes( 'heading' ) )?.fontFamily ??
		live.design?.headingFont;
	const bodyFamily =
		live.fonts?.find( ( font ) => font.slug?.includes( 'body' ) )?.fontFamily ??
		live.design?.bodyFont;
	useFontPreview(
		[
			live.fonts?.find( ( font ) => font.slug?.includes( 'heading' ) )?.name ??
				live.design?.headingFont,
			live.fonts?.find( ( font ) => font.slug?.includes( 'body' ) )?.name ?? live.design?.bodyFont,
		].filter( ( family ): family is string => Boolean( family ) )
	);

	const pages = live.pages ?? [];
	const frontPage = pages.find( ( page ) => page.front ) ?? pages[ 0 ];

	// Rotate through the pages once more than one has a completed section, so
	// the long delivery tail becomes a tour of what was built.
	const pagesWithContent = useMemo(
		() =>
			pages.filter( ( page ) =>
				Object.values( live.sections ).some(
					( entry ) => entry.part === 'section' && entry.page === page.slug
				)
			),
		[ pages, live.sections ]
	);
	const [ tourIndex, setTourIndex ] = useState( 0 );
	useEffect( () => {
		if ( pagesWithContent.length < 2 ) {
			return;
		}
		const interval = window.setInterval(
			() => setTourIndex( ( index ) => index + 1 ),
			5000
		);
		return () => window.clearInterval( interval );
	}, [ pagesWithContent.length ] );
	const shownPage = pagesWithContent.length
		? pagesWithContent[ tourIndex % pagesWithContent.length ]
		: frontPage;

	const hero = heroSectionOf( live, shownPage?.slug );
	const header = live.sections.header;
	const doneCount = Object.values( live.sections ).filter(
		( entry ) => entry.part === 'section'
	).length;
	const planCount = live.planKeys?.filter(
		( key ) => key !== 'header' && key !== 'footer'
	).length;
	const heroImage = hero?.images?.[ 0 ]?.subject ?? live.imagesPlanned?.subjects?.[ 0 ];

	// Everything below renders from CSS custom properties, so absent data
	// leaves the stylesheet defaults (the original skeleton look) in place.
	const styleVars = {
		'--live-background': background,
		'--live-foreground': foreground,
		'--live-accent': accent,
		'--live-heading-font': headingFamily,
		'--live-body-font': bodyFamily,
	} as CSSProperties;

	const isHydrated = Boolean( colors?.length || pages.length || doneCount > 0 );
	const cardSections = ( shownPage?.sections ?? [] )
		.filter( ( section ) => section.slug !== hero?.section )
		.slice( 0, 3 );

	// The HTML-first graph ships a full first-fold design during prepare;
	// render the real thing in a fully sandboxed frame instead of the mock.
	if ( live.designAssets.home || live.designAssets.preview ) {
		const html = live.designAssets.home ?? live.designAssets.preview ?? '';
		const css = live.designAssets.css ?? '';
		return (
			<div className="site-generation__build-visual is-live" aria-hidden="true">
				<div className="site-generation__page-preview">
					<iframe
						className="site-generation__design-frame"
						sandbox=""
						srcDoc={ css ? html.replace( '</head>', `<style>${ css }</style></head>` ) : html }
						title="Design preview"
					/>
					<div className="site-generation__preview-scan" />
				</div>
			</div>
		);
	}

	return (
		<div
			aria-hidden="true"
			className={ `site-generation__build-visual${ isHydrated ? ' is-live' : '' }` }
			style={ styleVars }
		>
			<div className="site-generation__page-preview">
				<div className="site-generation__preview-bar">
					{ live.identity?.title ? (
						<span className="site-generation__preview-site-title">{ live.identity.title }</span>
					) : (
						<WordPressMark />
					) }
					<div className="site-generation__preview-nav">
						{ pages.length ? (
							pages
								.slice( 0, 4 )
								.map( ( page ) => (
									<span
										className={ `site-generation__preview-nav-label${
											page.slug === shownPage?.slug ? ' is-active' : ''
										}` }
										key={ page.slug || page.title }
									>
										{ page.title }
									</span>
								) )
						) : (
							<>
								<span className="site-generation__preview-nav-item" />
								<span className="site-generation__preview-nav-item" />
								<span className="site-generation__preview-nav-item" />
							</>
						) }
						{ ! pages.length && header?.heading && (
							<span className="site-generation__preview-nav-label">{ header.heading }</span>
						) }
					</div>
				</div>
				<div className="site-generation__preview-content">
					<div className="site-generation__preview-copy">
						{ live.design?.title ? (
							<span className="site-generation__preview-eyebrow">{ live.design.title }</span>
						) : (
							<span className="site-generation__preview-line is-eyebrow" />
						) }
						{ hero?.heading ? (
							<span className="site-generation__preview-heading">{ hero.heading }</span>
						) : (
							<>
								<span className="site-generation__preview-line is-heading" />
								<span className="site-generation__preview-line is-heading is-short" />
							</>
						) }
						{ hero?.text ? (
							<span className="site-generation__preview-text">{ hero.text }</span>
						) : (
							<>
								<span className="site-generation__preview-line is-copy" />
								<span className="site-generation__preview-line is-copy is-short" />
							</>
						) }
						{ hero?.buttons?.[ 0 ] ? (
							<span className="site-generation__preview-button">{ hero.buttons[ 0 ] }</span>
						) : (
							<span className="site-generation__preview-line is-button" />
						) }
					</div>
					<div className="site-generation__preview-media">
						{ heroImage ? (
							<span className="site-generation__preview-media-caption">{ heroImage }</span>
						) : (
							<WordPressMark />
						) }
					</div>
				</div>
				<div className="site-generation__preview-cards">
					{ cardSections.length ? (
						cardSections.map( ( section, index ) => {
							const built = Object.values( live.sections ).some(
								( entry ) =>
									entry.part === 'section' &&
									entry.page === shownPage?.slug &&
									entry.section === section.slug
							);
							return (
								<span
									className={ `site-generation__preview-card${ built ? ' is-built' : '' }` }
									key={ section.slug ?? index }
								>
									{ section.title ?? '' }
								</span>
							);
						} )
					) : (
						<>
							<span className="site-generation__preview-card" />
							<span className="site-generation__preview-card" />
							<span className="site-generation__preview-card" />
						</>
					) }
				</div>
				<div className="site-generation__preview-scan" />
			</div>
			{ planCount !== undefined && planCount > 0 && (
				<p className="site-generation__build-counter">
					{ Math.min( doneCount, planCount ) } / { planCount }
				</p>
			) }
		</div>
	);
}

function WaitingCanvas( { live }: { live: LiveBuildState } ) {
	const translate = useTranslate();

	const title = live.identity?.title
		? translate( 'We’re building %(siteTitle)s', {
				args: { siteTitle: live.identity.title },
		  } )
		: translate( 'We’re building your site' );
	const description = live.design?.description
		? live.design.description
		: translate(
				'This can take a few minutes. We’ll take you to the editor when your site is ready.'
		  );

	return (
		<div className="site-generation__waiting">
			<BuildVisualization live={ live } />
			<div className="site-generation__waiting-copy">
				<h1 className="site-generation__waiting-title">{ title }</h1>
				<p className="site-generation__waiting-description">{ description }</p>
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
					{ translate( 'Generating your site' ) }
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

	return (
		<main className="site-generation" data-generation-view={ state.status }>
			<section className="site-generation__editor" aria-label={ translate( 'Site generation' ) }>
				<div aria-label="WordPress.com" className="site-generation__brand" role="img">
					<WordPressWordmark className="site-generation__brand-logo" color="currentColor" />
				</div>
				<div className="site-generation__canvas">
					{ state.status === 'failed' ? (
						<ErrorCanvas state={ state } onReload={ onReload } />
					) : (
						<WaitingCanvas live={ state.liveBuild } />
					) }
				</div>
			</section>
			<aside
				aria-label={ translate( 'Site generation progress' ) }
				className="site-generation__sidebar"
			>
				<div className="site-generation__sidebar-header">
					<Icon
						aria-hidden="true"
						className="site-generation__assistant-icon"
						icon={ sparkles }
						size={ 32 }
					/>
				</div>
				<div className="site-generation__conversation">
					<p className="site-generation__conversation-message">
						{ translate( 'Your site is being prepared. You can follow its progress here.' ) }
					</p>
					<BuildProgress state={ state } />
				</div>
			</aside>
		</main>
	);
}
