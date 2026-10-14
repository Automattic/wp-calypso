import page from '@automattic/calypso-router';
import { Button as CalypsoButton } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Notice,
	ProgressBar,
	Spinner,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import AgentsManagerLoader from 'calypso/layout/agents-manager-loader';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useRedesignRouteAccess } from './eligibility';
import { usePreviewNavigation } from './use-preview-navigation';
import { canRestart, useRedesign } from './use-redesign';
import { useAgentTurnActivity, useRedesignAgent } from './use-redesign-agent';
import { useStartDesigning } from './use-start-designing';
import type { DesignBrief, Redesign } from './api';
import type { ReactNode } from 'react';

import './style.scss';

export default function SiteRedesign() {
	const selectedSite = useSelector( getSelectedSite );
	const stylesheet = useSelector( ( state ) =>
		getSiteOption( state, selectedSite?.ID, 'theme_slug' )
	);
	const frameNonce = useSelector( ( state ) =>
		getSiteOption( state, selectedSite?.ID, 'frame_nonce' )
	);
	// Under the checkout exception the workspace only ever rewrites `redesign` to the same id.
	const access = useRedesignRouteAccess( window.location.search );
	const redirectTo = access.state === 'redirect' ? access.to : null;
	useEffect( () => {
		if ( redirectTo ) {
			page.redirect( redirectTo );
		}
	}, [ redirectTo ] );
	if ( ! selectedSite || access.state === 'loading' || access.state === 'redirect' ) {
		return <Spinner />;
	}
	if ( access.state !== 'allowed' ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ access.state === 'error'
					? __( 'Unable to check redesign availability. Refresh this page to try again.' )
					: __(
							'This site is not eligible for a redesign, or you do not have permission to change its design.'
						) }
			</Notice>
		);
	}
	return (
		<RedesignWorkspace
			key={ selectedSite.ID }
			siteId={ selectedSite.ID }
			siteUrl={ selectedSite.URL }
			siteSlug={ selectedSite.slug }
			stylesheet={ typeof stylesheet === 'string' ? stylesheet : undefined }
			frameNonce={ typeof frameNonce === 'string' ? frameNonce : undefined }
			applyOnly={ access.applyOnly }
		/>
	);
}

export function getOriginalPreviewUrl(
	siteUrl: string,
	path: string,
	stylesheet?: string,
	frameNonce?: string
) {
	if ( ! stylesheet ) {
		return null;
	}
	const site = new URL( siteUrl );
	const candidate = new URL( path, siteUrl );
	const url = candidate.origin === site.origin ? candidate : site;
	url.searchParams.set( 'theme', stylesheet );
	url.searchParams.set( 'hide_banners', 'true' );
	url.searchParams.set( 'iframe', 'true' );
	if ( frameNonce ) {
		url.searchParams.set( 'frame-nonce', frameNonce );
	}
	return url.href;
}

export function RedesignWorkspace( {
	siteId,
	siteUrl,
	siteSlug,
	stylesheet,
	frameNonce,
	applyOnly = false,
}: {
	siteId: number;
	siteUrl: string;
	siteSlug: string;
	stylesheet?: string;
	frameNonce?: string;
	/** Back from checkout on a paid plan: only the design already generated may be used. */
	applyOnly?: boolean;
} ) {
	const {
		run,
		brief,
		error,
		busy,
		path,
		setPath,
		preview,
		previewError,
		load,
		generate,
		apply,
		rollback,
		restart,
		succession,
		closed,
	} = useRedesign( siteId, { applyOnly } );
	// Back from checkout, a run that cannot be used here sends the user back to Themes.
	useEffect( () => {
		if ( closed ) {
			page.redirect( `/themes/${ siteSlug }` );
		}
	}, [ closed, siteSlug ] );
	const {
		ready: agentReady,
		connected,
		agentUnavailable,
		conversationKey,
	} = useRedesignAgent( run, succession, applyOnly );
	const isMobile = useMediaQuery( '(max-width: 1199px)' );
	const [ mobilePanel, setMobilePanel ] = useState( 'interview' );
	const [ comparison, setComparison ] = useState< Comparison >( null );
	const snapshot = useRef< RunSnapshot | null >( null );
	const runId = run?.id;
	const generationId = run?.generation?.id;
	const runStatus = run?.status;
	const briefRevision = run?.brief_revision;
	const pendingBrief = hasPendingBrief( run );
	// The agent starts generation from the chat: follow the run from brief to progress to preview.
	useEffect( () => {
		if ( ! runId ) {
			return;
		}
		const current = { runId, generationId, status: runStatus, briefRevision };
		const previous = snapshot.current;
		snapshot.current = current;
		setComparison( ( value ) => reconcileComparison( value, previous, current, pendingBrief ) );
	}, [ runId, generationId, runStatus, briefRevision, pendingBrief ] );
	const isGenerating = run?.status === 'generating';
	const isApplying = run?.status === 'applying';
	const hasPreview = !! run && [ 'preview_ready', 'applying', 'applied' ].includes( run.status );
	const requiresSourceConfirmation = run?.apply?.error?.requires === 'allow_source_changes';
	// Both starts stay available: the agent after a chat approval, or this page's button.
	const canGenerate =
		! applyOnly &&
		!! run?.brief_draft &&
		!! run.brief_revision &&
		!! run.eligibility.can_preview &&
		( ! hasPreview || pendingBrief ) &&
		! busy &&
		! [ 'generating', 'applying', 'applied', 'superseded', 'rolled_back' ].includes( run.status );
	// Starting over makes a fresh run and conversation; the live site is untouched.
	const canStartNewBrief = ! applyOnly && !! brief && canRestart( run );
	const [ restarting, setRestarting ] = useState( false );
	const agentAnswering = useAgentTurnActivity();
	const startDesigningError = useStartDesigning( run, connected, agentAnswering, applyOnly );
	const startNewBrief = async () => {
		setRestarting( true );
		try {
			await restart();
		} finally {
			setRestarting( false );
		}
	};
	// Whoever started over, the fresh interview happens in the chat.
	const successorId = succession?.to;
	useEffect( () => {
		if ( successorId ) {
			setMobilePanel( 'interview' );
		}
	}, [ successorId ] );
	const previewFrame = useRef< HTMLIFrameElement >( null );
	usePreviewNavigation(
		previewFrame,
		run?.generation?.id,
		siteUrl,
		path,
		run?.preview?.routes,
		setPath
	);
	const originalUrl = getOriginalPreviewUrl( siteUrl, path, stylesheet, frameNonce );
	const isRolledBack = run?.status === 'rolled_back';
	const showOriginal =
		!! brief &&
		( hasPreview || isRolledBack ) &&
		( comparison === 'original' || ( isRolledBack && comparison !== 'brief' ) );
	const showCandidate = ! showOriginal && hasPreview && comparison !== 'brief';
	const showCanvas = showOriginal || showCandidate;
	// One view at a time: the generated design, the live site, or the brief and its progress.
	let view = 'brief';
	if ( showOriginal ) {
		view = 'original';
	} else if ( showCandidate ) {
		view = 'new';
	}
	const views: { value: string; label: string }[] = [];
	if ( hasPreview ) {
		views.push( { value: 'new', label: __( 'New design' ) } );
	}
	if ( originalUrl && brief ) {
		views.push( { value: 'original', label: __( 'Original' ) } );
	}
	// A finished run keeps its brief reachable while the user can start over from it.
	if ( ! hasPreview || run?.status === 'preview_ready' || canStartNewBrief ) {
		views.push( { value: 'brief', label: __( 'Design brief' ) } );
	}
	const canSwitchView =
		( hasPreview || isRolledBack ) && views.length > 1 && ( ! isRolledBack || canStartNewBrief );

	return (
		<div className="site-redesign-workspace">
			<section
				className="site-redesign-interview"
				aria-label={ __( 'WordPress Agent design interview' ) }
				hidden={ isMobile && mobilePanel !== 'interview' }
			>
				<div id="site-redesign-agent" />
				{ ! connected && ! agentUnavailable && (
					<div className="site-redesign-agent-loading" role="status">
						<Spinner />
						{ __( 'Opening the WordPress Agent…' ) }
					</div>
				) }
				{ agentReady && (
					<AgentsManagerLoader key={ conversationKey } sectionName="site-redesign" />
				) }
			</section>
			<main className="site-redesign-main">
				{ ( isMobile || hasPreview || isRolledBack ) && (
					<header className="site-redesign-toolbar">
						{ isMobile && (
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								className="site-redesign-panel-switch"
								hideLabelFromVision
								label={ __( 'Panel' ) }
								value={ mobilePanel }
								onChange={ ( next ) => setMobilePanel( String( next ) ) }
							>
								<ToggleGroupControlOption
									value="interview"
									label={ __( 'Agent' ) }
									aria-label={ __( 'WordPress Agent' ) }
								/>
								<ToggleGroupControlOption value="preview" label={ __( 'Design' ) } />
							</ToggleGroupControl>
						) }
						{ canSwitchView && (
							<div className="site-redesign-view-controls">
								{ canSwitchView && (
									<ToggleGroupControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										hideLabelFromVision
										isAdaptiveWidth
										label={ __( 'View' ) }
										value={ view }
										onChange={ ( next ) => {
											if ( next === 'brief' ) {
												setComparison( hasPreview || isRolledBack ? 'brief' : null );
											} else {
												setComparison( next === 'original' ? 'original' : 'new' );
											}
											setMobilePanel( 'preview' );
										} }
									>
										{ views.map( ( option ) => (
											<ToggleGroupControlOption
												key={ option.value }
												value={ option.value }
												label={ option.label }
											/>
										) ) }
									</ToggleGroupControl>
								) }
							</div>
						) }
						{ run?.status === 'preview_ready' && (
							<Button
								__next40pxDefaultSize
								className="site-redesign-apply"
								variant="primary"
								disabled={ busy || ! preview || requiresSourceConfirmation }
								onClick={ () => void apply() }
							>
								{ __( 'Use this design' ) }
							</Button>
						) }
					</header>
				) }
				<section
					className="site-redesign-preview"
					aria-label={ __( 'Site preview' ) }
					hidden={ isMobile && mobilePanel !== 'preview' }
				>
					<div className="site-redesign-notices">
						{ ( error || startDesigningError ) && (
							<Notice status="error" isDismissible={ false }>
								{ error || startDesigningError }{ ' ' }
								<Button __next40pxDefaultSize onClick={ () => void load() } disabled={ busy }>
									{ __( 'Try again' ) }
								</Button>
							</Notice>
						) }
						{ agentUnavailable && (
							<Notice status="error" isDismissible={ false }>
								{ __( 'The WordPress Agent could not open. Reload this workspace to reconnect.' ) }
								<Button __next40pxDefaultSize onClick={ () => window.location.reload() }>
									{ __( 'Reconnect' ) }
								</Button>
							</Notice>
						) }
						{ run?.status === 'applied' && (
							<Notice status="success" isDismissible={ false }>
								{ __( 'Your design is live.' ) }{ ' ' }
								{ run.applied?.can_rollback && (
									<Button
										__next40pxDefaultSize
										variant="secondary"
										disabled={ busy }
										onClick={ () => {
											setComparison( 'original' );
											void rollback();
										} }
									>
										{ __( 'Undo design' ) }
									</Button>
								) }{ ' ' }
								<a href={ siteUrl }>{ __( 'View site' ) }</a>
							</Notice>
						) }
						{ hasPreview && run?.apply?.status === 'failed' && (
							<Notice status="error" isDismissible={ false }>
								{ requiresSourceConfirmation
									? __(
											'Your content changed since this preview. You can generate a new design, or use this design with your current content.'
										)
									: __( 'Unable to use this design. Review your preview and try again.' ) }
								{ requiresSourceConfirmation && (
									<Button
										__next40pxDefaultSize
										disabled={ busy || ! preview }
										onClick={ () => void apply( true ) }
									>
										{ __( 'Use this design anyway' ) }
									</Button>
								) }
							</Notice>
						) }
						{ run?.status === 'rolled_back' && (
							<Notice status="success" isDismissible={ false }>
								{ __( 'Your previous design has been restored.' ) }
							</Notice>
						) }
					</div>
					{ isApplying && showCanvas && run && (
						<div className="site-redesign-applying-banner" role="status">
							<Spinner />
							{ isRollingBack( run ) ? (
								<strong>{ __( 'Restoring your previous design' ) }</strong>
							) : (
								<span>
									<strong>{ __( 'Using your new design' ) }</strong>
									<span className="site-redesign-banner-stage">
										{ getApplyStages( run ).current }
									</span>
								</span>
							) }
						</div>
					) }
					{ showCanvas ? (
						<>
							{ run?.content && ( run.content.truncated || run.content.unsupported.length > 0 ) && (
								<Notice status="warning" isDismissible={ false }>
									{ sprintf(
										/* translators: %1$s: pages, %2$s: posts, %3$s: media items. */
										__( 'Preview content: %1$s pages, %2$s posts, and %3$s media items.' ),
										formatNumber( run.content.pages ),
										formatNumber( run.content.posts ),
										formatNumber( run.content.media )
									) }
									{ run.content.truncated && (
										<p>
											{ __(
												'This preview uses a sample of your posts. All posts remain on your site.'
											) }
										</p>
									) }
									{ run.content.unsupported.map( ( item ) => (
										<p key={ item.code }>{ item.message }</p>
									) ) }
								</Notice>
							) }
							<div className="site-redesign-canvas">
								{ showOriginal && originalUrl && (
									<iframe
										key={ run?.status === 'rolled_back' ? 'restored' : 'original' }
										title={ __( 'Original site' ) }
										src={ originalUrl }
										sandbox="allow-scripts allow-same-origin"
									/>
								) }
								{ ! showOriginal && preview && (
									<iframe
										ref={ previewFrame }
										title={ __( 'New design preview' ) }
										sandbox="allow-scripts"
										srcDoc={ preview.html }
									/>
								) }
								{ ! showOriginal && ! preview && (
									<div role="status">
										<Spinner />
										{ __( 'Loading your design preview…' ) }
									</div>
								) }
							</div>
							{ previewError && (
								<Notice status="error" isDismissible={ false }>
									{ __( 'Unable to load this preview. Try loading your design again.' ) }
									<Button __next40pxDefaultSize onClick={ () => void load() }>
										{ __( 'Reload preview' ) }
									</Button>
								</Notice>
							) }
						</>
					) : (
						<div className="site-redesign-stage">
							{ ( isGenerating || isApplying ) && run ? (
								<ProgressPanel run={ run } />
							) : (
								<div
									className={
										brief ? 'site-redesign-panel is-brief' : 'site-redesign-panel is-welcome'
									}
								>
									{ brief ? (
										<>
											<BriefDirection brief={ brief } pending={ pendingBrief } />
											<p className="site-redesign-brief-next">
												{ applyOnly &&
													__(
														'This is the brief behind your design. Review the new design, then choose Use this design to make it live.'
													) }
												{ ! applyOnly &&
													pendingBrief &&
													__(
														'Approve this brief in the chat, or generate it here. You can also ask the WordPress Agent for changes.'
													) }
												{ ! applyOnly &&
													! pendingBrief &&
													canGenerate &&
													__(
														'This is the brief behind your current design. Generate it again, or start a new brief to try a different direction.'
													) }
												{ ! applyOnly &&
													! pendingBrief &&
													! canGenerate &&
													__(
														'This is the brief behind this design. Start a new brief to try a different direction; your live site stays as it is.'
													) }
											</p>
											{ ( canGenerate || canStartNewBrief ) && (
												<div className="site-redesign-panel-actions">
													{ canGenerate && (
														<Button
															__next40pxDefaultSize
															variant="primary"
															disabled={ agentAnswering }
															onClick={ () => {
																setComparison( null );
																setMobilePanel( 'preview' );
																void generate();
															} }
														>
															{ __( 'Generate design' ) }
														</Button>
													) }
													{ canStartNewBrief && (
														<CalypsoButton
															busy={ restarting }
															disabled={ restarting || busy || agentAnswering }
															onClick={ () => void startNewBrief() }
														>
															{ __( 'Start a new brief' ) }
														</CalypsoButton>
													) }
												</div>
											) }
										</>
									) : (
										<>
											<CardHeading tagName="h1" size={ 32 }>
												{ __( 'Design your own theme' ) }
											</CardHeading>
											<p className="site-redesign-lead">
												{ __( 'Give your site a fresh look with your existing content.' ) }
											</p>
											<ol className="site-redesign-steps">
												{ /* Without a brief, the interview is where the user is now. */ }
												<li className="is-current" aria-current="step">
													<strong>{ __( 'Chat with the WordPress Agent' ) }</strong>
													<span>
														{ __( 'Answer a few questions about your goals and style.' ) }
													</span>
												</li>
												<li>
													<strong>{ __( 'Approve your design brief' ) }</strong>
													<span>
														{ __(
															'Review it here, then approve it in the chat. The agent starts your design.'
														) }
													</span>
												</li>
												<li>
													<strong>{ __( 'Preview the new design' ) }</strong>
													<span>
														{ __(
															'Compare it with your current site, then choose Use this design.'
														) }
													</span>
												</li>
											</ol>
										</>
									) }
									{ run?.status === 'failed' && (
										<Notice status="error" isDismissible={ false }>
											{ __( 'Design generation failed. Ask the WordPress Agent to try again.' ) }
										</Notice>
									) }
								</div>
							) }
						</div>
					) }
				</section>
			</main>
		</div>
	);
}

type Stage = { key: string; label: string };

const getGenerationStages = (): Stage[] => [
	{ key: 'read', label: __( 'Reading your pages and menus' ) },
	{ key: 'plan', label: __( 'Planning the look' ) },
	{ key: 'design', label: __( 'Designing the header, footer, and templates' ) },
	{ key: 'build', label: __( 'Building your preview' ) },
];

// The steps a generation reports as it finishes them, in order, and the stage each belongs to.
const GENERATION_STEPS: [ string, string ][] = [
	[ 'snapshot', 'read' ],
	[ 'scaffold-theme', 'plan' ],
	[ 'scaffold-plugin', 'plan' ],
	[ 'dsl-explore', 'plan' ],
	[ 'dsl-plan', 'plan' ],
	[ 'theme-author', 'plan' ],
	[ 'existing-content', 'plan' ],
	[ 'apply-identity', 'plan' ],
	[ 'dsl-compose', 'design' ],
	[ 'dsl-repair', 'design' ],
	[ 'existing-content-chrome', 'design' ],
	[ 'dsl-variations', 'design' ],
	[ 'dsl-assets', 'build' ],
	[ 'dsl-transpile', 'build' ],
	[ 'dsl-export', 'build' ],
	[ 'bundle-fonts', 'build' ],
	[ 'fonts-php', 'build' ],
	[ 'theme-screenshot', 'build' ],
	[ 'dsl-validate', 'build' ],
];

/**
 * The stage a generation is working on: the one after the last step it finished. Null for a
 * step this list does not know, so the stages never claim more than the run reported.
 */
export function getGenerationStageIndex( step: string | null | undefined ): number | null {
	if ( ! step ) {
		return 0;
	}
	const index = GENERATION_STEPS.findIndex( ( [ id ] ) => id === step );
	if ( index === -1 ) {
		return null;
	}
	const next = GENERATION_STEPS[ index + 1 ] ?? GENERATION_STEPS[ index ];
	return getGenerationStages().findIndex( ( stage ) => stage.key === next[ 1 ] );
}

const getApplyStageList = (): Stage[] => [
	{ key: 'prepare', label: __( 'Preparing your site' ) },
	{ key: 'install', label: __( 'Installing the new design' ) },
	{ key: 'switch', label: __( 'Switching to the new design' ) },
];

export function getApplyStages( run: Redesign ): { index: number; current: string } {
	const index = { delivering: 1, activating: 2 }[ run.apply?.status ?? '' ] ?? 0;
	return { index, current: getApplyStageList()[ index ].label };
}

/** Undo also runs as `applying`, with its own apply status. */
export function isRollingBack( run: Redesign ): boolean {
	return run.status === 'applying' && run.apply?.status === 'rolling_back';
}

const SWATCH = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function ProgressPanel( { run }: { run: Redesign } ) {
	if ( isRollingBack( run ) ) {
		return (
			<div className="site-redesign-panel site-redesign-progress-panel">
				<CardHeading tagName="h1" size={ 32 }>
					{ __( 'Restoring your previous design' ) }
				</CardHeading>
				<ProgressBar
					className="site-redesign-progress-bar"
					aria-label={ __( 'Restore progress' ) }
				/>
				<p className="site-redesign-hint">
					{ __( 'Your site is switching back to the design it had before this redesign.' ) }
				</p>
			</div>
		);
	}
	const isApplying = run.status === 'applying';
	const progress = run.generation?.progress;
	const stages = isApplying ? getApplyStageList() : getGenerationStages();
	const currentIndex = isApplying
		? getApplyStages( run ).index
		: getGenerationStageIndex( progress?.step );

	return (
		<div className="site-redesign-panel site-redesign-progress-panel">
			<span className="site-redesign-direction-status is-pending">
				{ isApplying ? __( 'Applying' ) : __( 'In progress' ) }
			</span>
			<CardHeading tagName="h1" size={ 32 }>
				{ isApplying ? __( 'Using your new design' ) : __( 'Generating your design' ) }
			</CardHeading>
			{ isApplying && (
				<ProgressBar className="site-redesign-progress-bar" aria-label={ __( 'Apply progress' ) } />
			) }
			<div className="site-redesign-progress-detail">
				<ol
					className="site-redesign-stages"
					aria-label={ __( 'Design stages' ) }
					aria-live="polite"
				>
					{ stages.map( ( stage, index ) => {
						let state = 'current';
						if ( currentIndex === null || index > currentIndex ) {
							state = 'upcoming';
						} else if ( index < currentIndex ) {
							state = 'done';
						}
						return (
							<li
								key={ stage.key }
								className={ `site-redesign-stage-item is-${ state }` }
								aria-current={ state === 'current' ? 'step' : undefined }
							>
								<span className="site-redesign-stage-marker" aria-hidden="true">
									{ state === 'done' && <Icon icon={ check } size={ 16 } /> }
								</span>
								{ stage.label }
							</li>
						);
					} ) }
				</ol>
			</div>
			{ isApplying && run.apply?.status === 'awaiting_atomic' && (
				<p className="site-redesign-hint">
					{ __( 'Preparing your site for its new design. This can take up to two hours.' ) }
				</p>
			) }
			{ isApplying && (
				<p className="site-redesign-hint">
					{ __( 'Your current design stays live until the new one is ready.' ) }
				</p>
			) }
		</div>
	);
}

/**
 * A generic family the visitor's own words name, so the specimen hints at the voice without
 * claiming a typeface the brief does not choose.
 */
function genericFamily( description?: string ): string | undefined {
	const text = description?.toLowerCase() ?? '';
	if ( /mono/.test( text ) ) {
		return 'ui-monospace, monospace';
	}
	if ( /sans/.test( text ) ) {
		return 'ui-sans-serif, system-ui, sans-serif';
	}
	if ( /serif/.test( text ) ) {
		return 'ui-serif, Georgia, serif';
	}
	return undefined;
}

function BriefDirection( { brief, pending }: { brief: DesignBrief; pending: boolean } ) {
	const colors = brief.palette?.colors?.filter( ( color ) => SWATCH.test( color ) ) ?? [];
	const headings = brief.typography?.headings;
	const body = brief.typography?.body;
	const rows: [ string, ReactNode ][] = [];
	if ( brief.mood_keywords?.length ) {
		rows.push( [
			__( 'The feeling' ),
			<ul className="site-redesign-chips" key="feeling">
				{ brief.mood_keywords.map( ( mood ) => (
					<li key={ mood }>{ mood }</li>
				) ) }
			</ul>,
		] );
	}
	if ( headings || body ) {
		rows.push( [
			__( 'The type' ),
			<dl className="site-redesign-faces" key="type">
				{ headings && (
					<div>
						<dt>{ __( 'Headings' ) }</dt>
						<dd style={ { fontFamily: genericFamily( headings ) } }>{ headings }</dd>
					</div>
				) }
				{ body && (
					<div>
						<dt>{ __( 'Body' ) }</dt>
						<dd style={ { fontFamily: genericFamily( body ) } }>{ body }</dd>
					</div>
				) }
			</dl>,
		] );
	}
	if ( colors.length > 0 || brief.palette?.description ) {
		rows.push( [
			__( 'The palette' ),
			<div className="site-redesign-palette" key="palette">
				{ brief.palette?.description && (
					<p className="site-redesign-direction-note">{ brief.palette.description }</p>
				) }
				{ colors.length > 0 && (
					<ul className="site-redesign-swatches">
						{ colors.map( ( color ) => (
							<li key={ color } aria-label={ color }>
								<span
									aria-hidden="true"
									className="site-redesign-swatch-chip"
									style={ { backgroundColor: color } }
								/>
								<span className="site-redesign-swatch-hex">{ color.toUpperCase() }</span>
							</li>
						) ) }
					</ul>
				) }
			</div>,
		] );
	}
	if ( brief.audience ) {
		rows.push( [ __( 'Audience' ), brief.audience ] );
	}
	if ( brief.references?.length ) {
		rows.push( [
			__( 'References' ),
			<ul className="site-redesign-references" key="references">
				{ brief.references.map( ( reference ) => (
					<li key={ reference }>{ reference }</li>
				) ) }
			</ul>,
		] );
	}

	return (
		<article className="site-redesign-direction">
			<header className="site-redesign-direction-mast">
				<span className={ `site-redesign-direction-status${ pending ? ' is-pending' : '' }` }>
					{ pending ? __( 'Ready to generate' ) : __( 'Behind your new design' ) }
				</span>
				<h1 className="site-redesign-direction-title">{ brief.goal }</h1>
			</header>
			<p className="site-redesign-direction-lede">{ brief.style }</p>
			{ rows.length > 0 && (
				// One group per row: a quiet label, then the detail at a readable width.
				<dl className="site-redesign-direction-rows">
					{ rows.map( ( [ label, detail ] ) => (
						<div key={ label } className="site-redesign-direction-row">
							<dt>{ label }</dt>
							<dd>{ detail }</dd>
						</div>
					) ) }
				</dl>
			) }
		</article>
	);
}

type Comparison = 'original' | 'new' | 'brief' | null;
type RunSnapshot = {
	runId: string;
	generationId?: string;
	status?: string;
	briefRevision?: number;
};

/** A brief revision the agent saved that no generation has used yet. */
export function hasPendingBrief( run: Redesign | null ): boolean {
	if ( ! run?.brief_draft || ! run.brief_revision ) {
		return false;
	}
	if ( ! run.generation ) {
		return true;
	}
	const used = run.generation.brief_revision;
	if ( typeof used === 'number' ) {
		return run.brief_revision > used;
	}
	// A generation from before revisions were recorded: the draft waits only if it differs.
	return canonicalJson( run.brief_draft ) !== canonicalJson( run.brief );
}

function canonicalJson( value: unknown ): string {
	return JSON.stringify( value, ( _key, item: unknown ) =>
		item && typeof item === 'object' && ! Array.isArray( item )
			? Object.fromEntries(
					Object.entries( item as Record< string, unknown > ).sort( ( [ a ], [ b ] ) =>
						a.localeCompare( b )
					)
				)
			: item
	);
}

/**
 * The view to show after the run changes. A new run starts fresh. A new generation, whether it
 * is still running or already finished between two polls, releases a brief view so its progress
 * and then its preview appear, unless a newer brief is waiting for review. A chosen Original view
 * stays. A newer brief revision on a finished design opens the brief, unless the visitor is
 * comparing with the original site.
 */
export function reconcileComparison(
	comparison: Comparison,
	previous: RunSnapshot | null,
	current: RunSnapshot,
	pendingBrief: boolean
): Comparison {
	if ( ! previous ) {
		return current.status === 'preview_ready' && pendingBrief && comparison === null
			? 'brief'
			: comparison;
	}
	if ( previous.runId !== current.runId ) {
		return null;
	}
	const generationChanged =
		!! current.generationId && previous.generationId !== current.generationId;
	const finished = previous.status === 'generating' && current.status === 'preview_ready';
	if ( ( generationChanged || finished ) && ! pendingBrief ) {
		return comparison === 'brief' ? null : comparison;
	}
	const newRevision = ( current.briefRevision ?? 0 ) > ( previous.briefRevision ?? 0 );
	if (
		current.status === 'preview_ready' &&
		pendingBrief &&
		newRevision &&
		comparison !== 'original'
	) {
		return 'brief';
	}
	return comparison;
}
