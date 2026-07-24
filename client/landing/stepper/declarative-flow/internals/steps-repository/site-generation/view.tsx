import { Button, Icon, Notice } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { SiteGenerationFailureReason, SiteGenerationState } from './use-site-generation';

// Email notifications are out of MVP scope. The copy is kept so it can be switched back on.
const HAS_EMAIL_NOTIFICATIONS: boolean = false;

const WordPressMark = () => <Icon className="site-generation__wordpress-mark" icon={ wordpress } />;

const CheckmarkIcon = (
	<svg
		aria-hidden="true"
		className="site-build-progress__check"
		fill="none"
		height="12"
		viewBox="0 0 12 12"
		width="12"
	>
		<path
			d="M10 3L4.5 8.5L2 6"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
	</svg>
);

function BuildVisualization( { state }: { state: SiteGenerationState } ) {
	const translate = useTranslate();
	const activeStep = state.steps.find( ( step ) => step.status === 'active' );
	const statusLabel = activeStep?.label ?? translate( 'Starting site generation' );

	return (
		<div className="site-generation__build-visual" aria-hidden="true">
			<div className="site-generation__build-status">
				<span className="site-generation__activity-grid">
					{ Array.from( { length: 9 }, ( _, index ) => (
						<span className="site-generation__activity-dot" key={ index } />
					) ) }
				</span>
				<span>{ statusLabel }</span>
				<span className="site-generation__live-dot" />
			</div>
			<div className="site-generation__page-preview">
				<div className="site-generation__preview-bar">
					<WordPressMark />
					<div className="site-generation__preview-nav">
						<span className="site-generation__preview-nav-item" />
						<span className="site-generation__preview-nav-item" />
						<span className="site-generation__preview-nav-item" />
					</div>
				</div>
				<div className="site-generation__preview-content">
					<div className="site-generation__preview-copy">
						<span className="site-generation__preview-line is-eyebrow" />
						<span className="site-generation__preview-line is-heading" />
						<span className="site-generation__preview-line is-heading is-short" />
						<span className="site-generation__preview-line is-copy" />
						<span className="site-generation__preview-line is-copy is-short" />
						<span className="site-generation__preview-line is-button" />
					</div>
					<div className="site-generation__preview-media">
						<WordPressMark />
					</div>
				</div>
				<div className="site-generation__preview-cards">
					<span className="site-generation__preview-card" />
					<span className="site-generation__preview-card" />
					<span className="site-generation__preview-card" />
				</div>
				<div className="site-generation__preview-scan" />
			</div>
		</div>
	);
}

function WaitingCanvas( { state }: { state: SiteGenerationState } ) {
	const translate = useTranslate();

	return (
		<div className="site-generation__waiting">
			<BuildVisualization state={ state } />
			<div className="site-generation__waiting-copy">
				<h1 className="site-generation__waiting-title">
					{ translate( 'We’re building your site' ) }
				</h1>
				<p className="site-generation__waiting-description">
					{ translate(
						'This can take a few minutes. We’ll keep you updated as your site comes together.'
					) }
				</p>
			</div>
		</div>
	);
}

function ErrorCanvas( {
	failureReason,
	onRetry,
}: {
	failureReason: SiteGenerationFailureReason;
	onRetry: () => void;
} ) {
	const translate = useTranslate();
	const hasTimedOut = failureReason === 'timed-out';
	const timedOutDescription = HAS_EMAIL_NOTIFICATIONS
		? translate( 'Your brief is saved. We’ll email you when your site is ready.' )
		: translate( 'Your brief is saved.' );

	return (
		<div aria-live="polite" className="site-generation__outcome" role="status">
			<div className="site-generation__outcome-icon" aria-hidden="true">
				<WordPressMark />
			</div>
			<h1 className="site-generation__outcome-title">
				{ hasTimedOut
					? translate( 'This is taking longer than expected' )
					: translate( 'We couldn’t check your site' ) }
			</h1>
			<p className="site-generation__outcome-description">
				{ hasTimedOut
					? timedOutDescription
					: translate( 'The site or editor destination is missing from this page.' ) }
			</p>
			<div className="site-generation__outcome-actions">
				<Button onClick={ onRetry } variant="primary">
					{ hasTimedOut ? translate( 'Check again' ) : translate( 'Reload' ) }
				</Button>
			</div>
		</div>
	);
}

function BuildProgress( { state }: { state: SiteGenerationState } ) {
	const translate = useTranslate();
	const visibleSteps = state.steps.filter( ( step ) => step.status !== 'pending' );
	const items =
		visibleSteps.length > 0
			? visibleSteps
			: [
					{
						id: 'starting',
						label: translate( 'Starting site generation' ),
						status: 'active' as const,
					},
			  ];
	const hasFailed = state.status === 'failed';

	return (
		<div className="site-build-progress">
			<div className="site-build-progress__header">
				<span className="site-build-progress__title">{ translate( 'Generating your site' ) }</span>
			</div>
			<ul aria-live="polite" className="site-build-progress__list">
				{ items.map( ( item, index ) => {
					const isInProgress = item.status !== 'complete';
					let indicator = CheckmarkIcon;
					if ( isInProgress ) {
						indicator = hasFailed ? (
							<span aria-hidden="true">…</span>
						) : (
							<div className="site-build-progress__spinner" />
						);
					}

					return (
						<li
							aria-current={ item.status === 'active' ? 'step' : undefined }
							className={ `site-build-progress__item ${
								isInProgress ? 'site-build-progress__item--in-progress' : ''
							}` }
							data-last={ index === items.length - 1 }
							key={ item.id }
						>
							<div
								aria-hidden="true"
								className={ `site-build-progress__indicator site-build-progress__indicator--${
									item.status === 'complete' ? 'completed' : 'loading'
								}` }
							>
								{ indicator }
							</div>
							<span className="site-build-progress__text">{ item.label }</span>
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
	onRetry,
}: {
	state: SiteGenerationState;
	onRetry: () => void;
} ) {
	const translate = useTranslate();

	return (
		<main className="site-generation" data-generation-view={ state.status }>
			<section className="site-generation__editor" aria-label={ translate( 'Site generation' ) }>
				<div className="site-generation__canvas">
					{ state.status === 'failed' ? (
						<ErrorCanvas
							failureReason={ state.failureReason ?? 'missing-parameters' }
							onRetry={ onRetry }
						/>
					) : (
						<WaitingCanvas state={ state } />
					) }
				</div>
			</section>
			<aside className="site-generation__sidebar">
				<header className="site-generation__sidebar-header">
					<div className="site-generation__assistant-title">
						<WordPressMark />
						<span>{ translate( 'AI Site Builder' ) }</span>
					</div>
				</header>
				<div className="site-generation__conversation">
					<p className="site-generation__conversation-message">
						{ translate( 'Your site is being prepared. You can follow its progress here.' ) }
					</p>
					<BuildProgress state={ state } />
				</div>
				{ HAS_EMAIL_NOTIFICATIONS && (
					<p className="site-generation__completion-note">
						{ translate( 'We’ll email you when your site is ready.' ) }
					</p>
				) }
			</aside>
		</main>
	);
}
