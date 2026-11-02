import { sitePurchasesQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, border, caution, external, published } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { getCurrentDashboard } from '../../app/routing';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { withJetpackSso } from '../../utils/site-sso';
import { getSourceHost, isPlatformHost } from './use-static-site-import';
import type { StaticSiteImport, StaticSiteImportSearch } from './use-static-site-import';
import type { Site, StaticSiteImportSession } from '@automattic/api-core';

import './style.scss';

export * from './use-static-site-import';

// The list moves on a timer and never finishes its last item before the session does.
const STEP_DURATION = 20000;

function useTimedStep( stepCount: number ) {
	const [ step, setStep ] = useState( 0 );
	useEffect( () => {
		const id = window.setInterval(
			() => setStep( ( current ) => Math.min( current + 1, stepCount - 1 ) ),
			STEP_DURATION
		);
		return () => window.clearInterval( id );
	}, [ stepCount ] );
	return step;
}

function MovingChecklist( { session }: { session?: StaticSiteImportSession } ) {
	const summary = Array.isArray( session?.preview_summary ) ? undefined : session?.preview_summary;
	const pages = summary?.pages;
	const items = [
		{
			label: __( 'Pages' ),
			total: pages
				? sprintf(
						/* translators: %s: formatted number of pages. */
						__( '%s pages' ),
						formatNumber( pages )
					)
				: '',
		},
		{ label: __( 'Images' ) },
		{ label: __( 'Fonts, colors, and layout' ) },
		{ label: __( 'Checking every page against your current site' ) },
	];
	const current = useTimedStep( items.length );

	return (
		<VStack as="ul" spacing={ 4 } className="static-site-import-card__checklist">
			{ items.map( ( item, index ) => {
				const isDone = index < current;
				const isCurrent = index === current;
				return (
					<HStack as="li" key={ item.label } justify="flex-start" spacing={ 3 }>
						{ isDone && (
							<Icon
								icon={ published }
								size={ 32 }
								style={ { fill: 'var(--dashboard__foreground-color-success)' } }
							/>
						) }
						{ isCurrent && <Spinner className="static-site-import-card__spinner" /> }
						{ ! isDone && ! isCurrent && (
							<Icon
								icon={ border }
								size={ 32 }
								style={ { fill: 'var(--dashboard__text-muted-color)' } }
							/>
						) }
						<Text variant={ isDone || isCurrent ? undefined : 'muted' }>{ item.label }</Text>
						{ isDone && item.total && (
							<Text variant="muted" className="static-site-import-card__count">
								{ item.total }
							</Text>
						) }
					</HStack>
				);
			} ) }
		</VStack>
	);
}

/**
 * Zendesk tags for a chat about a move, so Happiness can route it: a failed move goes to the
 * Migrations view, a finished one stays in normal routing. The `wpcom_wix_import` pair is the
 * one agreed with Happiness for Wix; the `wpcom_static_site_import` set covers every platform.
 */
export function getMoveHelpZendeskTags( outcome: 'success' | 'failed', platform?: string ) {
	const tags = [ 'wpcom_static_site_import', `wpcom_static_site_import_${ outcome }` ];
	const platformSlug = ( platform ?? '' ).toLowerCase();
	if ( /^[a-z0-9]{1,30}$/.test( platformSlug ) ) {
		tags.push( `wpcom_static_site_import_${ platformSlug }` );
	}
	if ( platformSlug === 'wix' ) {
		tags.push( 'wpcom_wix_import', `wpcom_wix_import_${ outcome }` );
	}
	return tags;
}

/**
 * Opens a chat with our team (not the AI assistant), with a message naming where the site
 * came from and tags that route it. Anyone the move didn't work for can have our team finish
 * it for free, or a refund.
 */
function useAskForMoveHelp( site: Site, outcome: 'success' | 'failed', platform?: string ) {
	const { setNewMessagingChat } = useHelpCenter();
	return ( initialMessage: string ) =>
		setNewMessagingChat( {
			initialMessage,
			section: 'static-site-import',
			siteUrl: site.URL,
			siteId: String( site.ID ),
			zendeskTags: getMoveHelpZendeskTags( outcome, platform ),
		} );
}

/** Takes the place of the progress card when a move fails. */
export function StaticSiteImportFailed( {
	site,
	search,
}: {
	site: Site;
	search: StaticSiteImportSearch;
} ) {
	const askForMoveHelp = useAskForMoveHelp( site, 'failed', search.platform );
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
							style={ { fill: 'var(--dashboard__foreground-color-error)' } }
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
					<HStack justify="flex-start" spacing={ 4 } wrap>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () =>
								askForMoveHelp(
									sprintf(
										/* translators: %s: the address of the site being moved, e.g. example.com. */
										__( 'My site move from %s stopped. Can your team move it for me?' ),
										sourceHost || __( 'my old platform' )
									)
								)
							}
						>
							{ __( 'Let our team move it' ) }
						</Button>
						{ refundUrl && (
							<Button variant="link" href={ refundUrl }>
								{ __( 'Get a refund' ) }
							</Button>
						) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
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
	const askForMoveHelp = useAskForMoveHelp( site, 'success', platform );
	const sourceHost = getSourceHost( from );
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

	const recordClick = ( action: 'connect_domain' | 'get_domain' | 'preview_site' | 'get_help' ) =>
		recordTracksEvent( 'calypso_dashboard_static_site_import_ready_notice_click', {
			...trackingProps,
			action,
		} );

	// A moved site stays Coming Soon, which lets in visitors logged in to the site itself. The owner
	// isn't until they first visit WP Admin, so open the site through SSO to log them in on the way.
	const previewUrl =
		site.is_coming_soon && site.is_wpcom_atomic ? withJetpackSso( site.URL ) : site.URL;

	const sourceName = sourceHost || __( 'my old platform' );

	if ( siteImport.isRefused ) {
		return (
			<Notice
				variant="error"
				title={ __( 'We can’t import this site' ) }
				actions={
					<Button __next40pxDefaultSize variant="link" onClick={ () => setShowHelpCenter( true ) }>
						{ __( 'Get help' ) }
					</Button>
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
					<Button __next40pxDefaultSize variant="secondary" onClick={ siteImport.retry }>
						{ __( 'Try again' ) }
					</Button>
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
					'It may belong to another account, or the link may be out of date. If you started it, open the link in the email we sent you.'
				) }
			</Notice>
		);
	}

	// A builder's free address (e.g. name.wixsite.com) isn't the customer's to connect,
	// so send them to find a domain instead of prefilling one they can't use.
	const ownedDomain = sourceHost && ! isPlatformHost( sourceHost ) ? sourceHost : '';
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
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ domainUrl }
								onClick={ () => recordClick( ownedDomain ? 'connect_domain' : 'get_domain' ) }
							>
								{ domainLabel }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="secondary"
								href={ previewUrl }
								target="_blank"
								rel="noopener noreferrer"
								icon={ external }
								iconPosition="right"
								onClick={ () => recordClick( 'preview_site' ) }
							>
								{ __( 'Preview site' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="link"
								onClick={ () => {
									recordClick( 'get_help' );
									askForMoveHelp(
										sprintf(
											/* translators: %s: the address of the site that was moved, e.g. example.com. */
											__(
												'My site moved from %s, but some things didn’t come across right. Can you help me with my move?'
											),
											sourceName
										)
									);
								} }
							>
								{ __( 'Something not right? Get help with your move' ) }
							</Button>
						</>
					}
				>
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
				</Notice>
			) }
		</>
	);
}
