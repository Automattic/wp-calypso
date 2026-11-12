import { sitePurchasesQuery, staticSiteImportHandoffMutation } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, border, caution, published } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { getCurrentDashboard } from '../../app/routing';
import { Card, CardBody } from '../../components/card';
import Notice, { NoticeActionButton, NoticeActionLinkButton } from '../../components/notice';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { withJetpackSso } from '../../utils/site-sso';
import { getPreviewPlansUrl } from '../site-fields/plan-awaiting-checkout';
import { getSourceHost } from './use-static-site-import';
import type { StaticSiteImport, StaticSiteImportSearch } from './use-static-site-import';
import type { Site, StaticSiteImportSession } from '@automattic/api-core';

import './style.scss';

export * from './use-static-site-import';

/**
 * The checklist item the move is on, from what the server reports: the runner finds the source's
 * pages, copies them, builds the WordPress site from the copy, and wpcom then delivers it here.
 */
function getCurrentStep( session?: StaticSiteImportSession ) {
	const progress = session?.progress;
	switch ( session?.state ) {
		case 'capturing':
			return progress?.pages_total && ! progress.finding_pages ? 1 : 0;
		case 'building':
			return 2;
		case 'preview_ready':
		case 'queued':
		case 'finished':
			return 3;
		default:
			return 0;
	}
}

const formatCount = ( current: number, total: number ) =>
	sprintf(
		/* translators: %1$s: formatted number of pages done so far, %2$s: formatted number of pages in all. */
		__( '%1$s of %2$s' ),
		formatNumber( current ),
		formatNumber( total )
	);

/**
 * What the build is doing, from the importer's own step. Steps that work page by page also say how
 * many pages are done. Servers that don't report the step show no detail.
 */
function getBuildDetail( progress?: StaticSiteImportSession[ 'progress' ] ) {
	if ( progress?.phase === 'exporting' ) {
		return __( 'Packaging your site' );
	}
	const building = progress?.building;
	if ( ! building ) {
		return progress?.phase === 'building' ? __( 'Setting up WordPress' ) : '';
	}
	const count = building.total > 0 ? formatCount( building.current, building.total ) : '';
	switch ( building.stage ) {
		case 'freezing':
		case 'prepare_shared':
		case 'preparing_shared':
			return __( 'Preparing your styles and layout' );
		case 'prepare_pages':
		case 'preparing_pages':
			return count
				? sprintf(
						/* translators: %s: progress such as "3 of 12". */
						__( 'Preparing your pages · %s' ),
						count
					)
				: __( 'Preparing your pages' );
		case 'compile_pages':
		case 'compiling_pages':
			return count
				? sprintf(
						/* translators: %s: progress such as "3 of 12". */
						__( 'Turning your pages into blocks · %s' ),
						count
					)
				: __( 'Turning your pages into blocks' );
		case 'compose':
		case 'composed':
		case 'canonical_plan':
			return __( 'Putting your theme together' );
		case 'prepare_lifecycle':
		case 'dependencies_prepared':
		case 'materialize':
		case 'materialization_claimed':
		case 'completed':
			return __( 'Creating your pages and theme' );
		default:
			return '';
	}
}

function MovingChecklist( { session }: { session?: StaticSiteImportSession } ) {
	const progress = session?.progress;
	const current = getCurrentStep( session );
	const pagesTotal = progress?.pages_total;
	// Until the capture settles on its total, the inspection's count is all that's known.
	const pagesFoundSoFar = progress?.source?.pages_found;
	let pagesFoundDetail = '';
	if ( pagesTotal ) {
		pagesFoundDetail = sprintf(
			/* translators: %s: formatted number of pages found on the site being moved. */
			_n( '%s page found', '%s pages found', pagesTotal ),
			formatNumber( pagesTotal )
		);
	} else if ( pagesFoundSoFar ) {
		pagesFoundDetail = sprintf(
			/* translators: %s: formatted number of pages found so far on the site being moved; more may follow. */
			_n( '%s page found so far', '%s pages found so far', pagesFoundSoFar ),
			formatNumber( pagesFoundSoFar )
		);
	}
	const items = [
		{
			label: __( 'Finding your pages' ),
			detail: pagesFoundDetail,
		},
		{
			label: __( 'Copying your pages' ),
			detail:
				current === 1 && pagesTotal ? formatCount( progress?.pages_captured ?? 0, pagesTotal ) : '',
		},
		{
			label: __( 'Building your WordPress site' ),
			detail: current === 2 ? getBuildDetail( progress ) : '',
		},
		{ label: __( 'Moving it onto your site' ), detail: '' },
	];

	return (
		<VStack as="ul" spacing={ 4 } className="static-site-import-card__checklist">
			{ items.map( ( item, index ) => {
				const isDone = index < current;
				const isCurrent = index === current;
				return (
					<HStack
						as="li"
						key={ item.label }
						justify="flex-start"
						spacing={ 3 }
						aria-current={ isCurrent ? 'step' : undefined }
					>
						{ isDone && (
							<Icon
								icon={ published }
								size={ 32 }
								style={ { color: 'var(--dashboard__foreground-color-success)' } }
							/>
						) }
						{ isCurrent && <Spinner className="static-site-import-card__spinner" /> }
						{ ! isDone && ! isCurrent && (
							<Icon
								icon={ border }
								size={ 32 }
								style={ { color: 'var(--dashboard__text-muted-color)' } }
							/>
						) }
						<Text variant={ isDone || isCurrent ? undefined : 'muted' }>{ item.label }</Text>
						{ item.detail && (
							<Text variant="muted" className="static-site-import-card__count">
								{ item.detail }
							</Text>
						) }
					</HStack>
				);
			} ) }
		</VStack>
	);
}

/**
 * The errors wpcom returns when it refused the handoff. Our team already knows and will email the
 * customer, so asking them to try again would only be refused again.
 */
const HANDOFF_REFUSED_CODES = [ 'migration_request_not_submitted', 'too_many_requests' ];

function getHandoffErrorCode( error: unknown ) {
	const code = ( error as { code?: unknown } | null | undefined )?.code;
	return typeof code === 'string' ? code : undefined;
}

/** Why the handoff didn't reach our team. */
function getHandoffErrorMessage( error: unknown ) {
	switch ( getHandoffErrorCode( error ) ) {
		case 'migration_request_not_submitted':
			return __(
				'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
			);
		case 'too_many_requests':
			return __(
				'You’ve already sent us several migration requests today. Our team will follow up by email on the ones we’ve received. If you need to add details, just reply to that email.'
			);
		default:
			return __( 'We couldn’t reach our team. Please try again.' );
	}
}

/**
 * Hands the move to our migrations team: files a ticket for the Non-WP Migrations queue, which
 * emails the customer to finish the move.
 */
function useMoveHandoff( site: Site, search: StaticSiteImportSearch ) {
	const locale = useLocale();
	const handoff = useMutation( staticSiteImportHandoffMutation() );
	const requestHandoff = () =>
		handoff.mutate( {
			blogUrl: site.slug,
			fromUrl: search.from ?? '',
			locale,
			importSessionId: search.importSessionId,
		} );
	// Offer the handoff only while it can still reach our team.
	const canRequestHandoff =
		! handoff.isSuccess &&
		! HANDOFF_REFUSED_CODES.includes( getHandoffErrorCode( handoff.error ) ?? '' );
	return { handoff, requestHandoff, canRequestHandoff };
}

/** Takes the place of the progress card when a move fails. */
export function StaticSiteImportFailed( {
	site,
	search,
}: {
	site: Site;
	search: StaticSiteImportSearch;
} ) {
	const { handoff, requestHandoff, canRequestHandoff } = useMoveHandoff( site, search );
	const sourceHost = getSourceHost( search.from );
	const { data: planPurchase } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( purchases ) => purchases.find( ( purchase ) => purchase.is_plan ),
	} );
	// Cancelling the plan is where the refund happens; the classic path forwards to
	// whichever dashboard the customer uses. Without a plan there's nothing to refund.
	const refundUrl = planPurchase
		? wpcomLink( `/me/purchases/${ site.slug }/${ planPurchase.ID }/cancel` )
		: undefined;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<HStack justify="flex-start" spacing={ 2 }>
						<Icon
							icon={ caution }
							size={ 24 }
							style={ { color: 'var(--dashboard__foreground-color-error)' } }
						/>
						<Heading level={ 2 } size={ 20 } weight={ 600 }>
							{ __( 'Your move stopped' ) }
						</Heading>
					</HStack>
					<Text>
						{ sourceHost
							? sprintf(
									/* translators: %s: the address of the site being moved, e.g. example.com. */
									__( 'Nothing is lost, and %s is still online.' ),
									sourceHost
								)
							: __( 'Nothing is lost, and your current site is still online.' ) }
					</Text>
					{ handoff.isError && (
						<Notice variant="error">{ getHandoffErrorMessage( handoff.error ) }</Notice>
					) }
					{ handoff.isSuccess ? (
						<Notice variant="success" title={ __( 'Our team has your move' ) }>
							{ __( 'We’ll email you to finish moving your site.' ) }
						</Notice>
					) : (
						<HStack justify="flex-start" spacing={ 4 } wrap>
							{ canRequestHandoff && (
								<Button
									__next40pxDefaultSize
									variant="primary"
									isBusy={ handoff.isPending }
									disabled={ handoff.isPending }
									onClick={ requestHandoff }
								>
									{ __( 'Let our team move it' ) }
								</Button>
							) }
							{ refundUrl && (
								<Button variant="link" href={ refundUrl }>
									{ __( 'Get a refund' ) }
								</Button>
							) }
						</HStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

/**
 * Open a preview site once its move finishes while the customer watches it here. Only after the
 * move was seen in progress, so coming back to a finished preview's Overview stays on it.
 * @param siteImport The site's import, from useStaticSiteImport().
 */
export function useOpenPreviewWhenReady( siteImport: StaticSiteImport | null ) {
	const hasSeenMoving = useRef( false );
	const status = siteImport?.status;
	const previewUrl = siteImport?.previewUrl;
	useEffect( () => {
		if ( status === 'moving' ) {
			hasSeenMoving.current = true;
			return;
		}
		if ( hasSeenMoving.current && status === 'finished' && previewUrl ) {
			hasSeenMoving.current = false;
			window.location.assign( previewUrl );
		}
	}, [ status, previewUrl ] );
}

/** Takes the place of the overview cards while the site is being moved. */
export function StaticSiteImportProgress( {
	siteImport,
	search,
}: {
	siteImport: StaticSiteImport;
	search: StaticSiteImportSearch;
} ) {
	const sourceHost = getSourceHost( search.from );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<Heading level={ 2 } size={ 20 } weight={ 600 }>
						{ __( 'We’re moving your site' ) }
					</Heading>
					<Text variant="muted">
						{ sourceHost
							? sprintf(
									/* translators: %s: the domain of the site being moved, e.g. example.com. */
									__( 'We’re rebuilding %s here. Your current site stays live and unchanged.' ),
									sourceHost
								)
							: __(
									'We’re rebuilding your site here. Your current site stays live and unchanged.'
								) }
					</Text>
					<MovingChecklist session={ siteImport.session } />
					<Notice variant="info">
						{ __( 'You can close this page. We’ll email you when it’s done.' ) }
					</Notice>
				</VStack>
			</CardBody>
		</Card>
	);
}

/** Tops the regular overview once the move has finished or failed. */
export function StaticSiteImportNotice( {
	site,
	siteImport,
	search,
}: {
	site: Site;
	siteImport: StaticSiteImport;
	search: StaticSiteImportSearch;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter } = useHelpCenter();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { from, platform } = search;
	const { handoff, requestHandoff, canRequestHandoff } = useMoveHandoff( site, search );
	const sourceHost = getSourceHost( from );
	// What the move found that may need our team, already in the reader's language.
	const reviewNote = siteImport.session?.review_note;
	const isReady = siteImport.status === 'finished';
	const trackingProps = {
		site_id: site.ID,
		source_platform: platform,
	};

	// Counts notices shown, so clicks on its buttons can be read as a rate.
	const hasRecordedImpression = useRef( false );
	useEffect( () => {
		if ( ! isReady || hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_dashboard_static_site_import_ready_notice_impression', {
			site_id: site.ID,
			source_platform: platform,
		} );
	}, [ isReady, recordTracksEvent, site.ID, platform ] );

	const recordClick = (
		action: 'connect_domain' | 'get_domain' | 'preview_site' | 'request_handoff' | 'choose_plan'
	) =>
		recordTracksEvent( 'calypso_dashboard_static_site_import_ready_notice_click', {
			...trackingProps,
			action,
		} );

	// A moved site stays Coming Soon, which lets in visitors logged in to the site itself. The owner
	// isn't until they first visit WP Admin, so open the site through SSO to log them in on the way.
	const previewUrl =
		site.is_coming_soon && site.is_wpcom_atomic ? withJetpackSso( site.URL ) : site.URL;

	if ( siteImport.isRefused ) {
		return (
			<Notice
				variant="error"
				title={ __( 'We can’t import this site' ) }
				actions={
					<NoticeActionButton variant="minimal" onClick={ () => setShowHelpCenter( true ) }>
						{ __( 'Get help' ) }
					</NoticeActionButton>
				}
			>
				{ __( 'Its content isn’t allowed on WordPress.com.' ) }
			</Notice>
		);
	}

	// A failed move shows StaticSiteImportFailed in place of the progress card instead.
	if ( siteImport.status === 'failed' ) {
		return null;
	}

	if ( siteImport.status === 'stalled' ) {
		return (
			<Notice
				variant="warning"
				title={ __( 'Your move hasn’t started yet' ) }
				actions={
					<>
						<NoticeActionButton variant="solid" onClick={ siteImport.retry }>
							{ __( 'Try again' ) }
						</NoticeActionButton>
						<NoticeActionButton variant="outline" onClick={ () => setShowHelpCenter( true ) }>
							{ __( 'Contact us' ) }
						</NoticeActionButton>
					</>
				}
			>
				{ __( 'Something stopped it from starting. Nothing has changed on your current site.' ) }
			</Notice>
		);
	}

	if ( siteImport.status === 'unavailable' ) {
		return (
			<Notice variant="info" title={ __( 'We can’t show this move' ) }>
				{ __(
					'It may belong to another account. If you started it, make sure you’re logged in to that account.'
				) }
			</Notice>
		);
	}

	// A preview has no plan to connect a domain with: keeping it is the next step.
	if ( isReady && siteImport.isPreview ) {
		return (
			<Notice
				variant="success"
				title={ __( 'Your preview is ready' ) }
				actions={
					<>
						<NoticeActionLinkButton
							variant="solid"
							href={ siteImport.previewUrl || previewUrl }
							openInNewTab
							rel="noopener noreferrer"
							onClick={ () => recordClick( 'preview_site' ) }
						>
							{ __( 'View site' ) }
						</NoticeActionLinkButton>
						<NoticeActionLinkButton
							variant="outline"
							href={ getPreviewPlansUrl( site ) }
							onClick={ () => recordClick( 'choose_plan' ) }
						>
							{ __( 'Choose a plan' ) }
						</NoticeActionLinkButton>
					</>
				}
			>
				{ sourceHost
					? sprintf(
							/* translators: %s: the domain of the site that was copied, e.g. example.com. */
							__( '%s is copied onto a preview site. Choose a plan to keep it.' ),
							sourceHost
						)
					: __( 'Your site is copied onto a preview site. Choose a plan to keep it.' ) }
			</Notice>
		);
	}

	// The server names a domain only when the customer owns it; otherwise they get one.
	const ownedDomain = siteImport.session?.connectable_domain ?? '';
	const domainUrl = ownedDomain
		? addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
				initialQuery: ownedDomain,
				siteSlug: site.slug,
				dashboard: getCurrentDashboard(),
				back_to: redirectToDashboardLink(),
			} )
		: getAddSiteDomainUrl( site.slug );
	const domainLabel = ownedDomain
		? sprintf(
				/* translators: %s: the site's domain, e.g. example.com. */
				__( 'Connect %s' ),
				ownedDomain
			)
		: __( 'Get a domain' );

	return (
		<>
			{ ! isDismissed && (
				<Notice
					variant="success"
					title={ __( 'Your site is ready' ) }
					onClose={ () => {
						recordTracksEvent(
							'calypso_dashboard_static_site_import_ready_notice_dismiss',
							trackingProps
						);
						setIsDismissed( true );
					} }
					actions={
						<>
							<NoticeActionLinkButton
								variant="solid"
								href={ domainUrl }
								onClick={ () => recordClick( ownedDomain ? 'connect_domain' : 'get_domain' ) }
							>
								{ domainLabel }
							</NoticeActionLinkButton>
							<NoticeActionLinkButton
								variant="outline"
								href={ previewUrl }
								openInNewTab
								rel="noopener noreferrer"
								onClick={ () => recordClick( 'preview_site' ) }
							>
								{ __( 'Preview site' ) }
							</NoticeActionLinkButton>
							{ canRequestHandoff && (
								<NoticeActionButton
									variant="minimal"
									loading={ handoff.isPending }
									disabled={ handoff.isPending }
									onClick={ () => {
										recordClick( 'request_handoff' );
										requestHandoff();
									} }
								>
									{ __( 'Something not right? Let our team fix it' ) }
								</NoticeActionButton>
							) }
						</>
					}
				>
					<VStack spacing={ 2 }>
						<span>
							{ sourceHost
								? sprintf(
										/* translators: %s: the domain of the site that was moved, e.g. example.com. */
										__(
											'%s is copied and running on WordPress.com. It stays private until you launch it.'
										),
										sourceHost
									)
								: __(
										'Your site is copied and running on WordPress.com. It stays private until you launch it.'
									) }
						</span>
						{ reviewNote && <span>{ reviewNote }</span> }
						{ handoff.isError && <span>{ getHandoffErrorMessage( handoff.error ) }</span> }
						{ handoff.isSuccess && (
							<span>
								{ __( 'Our team has your move. We’ll email you to finish moving your site.' ) }
							</span>
						) }
					</VStack>
				</Notice>
			) }
		</>
	);
}
