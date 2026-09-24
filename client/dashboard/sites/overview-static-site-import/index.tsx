import {
	STATIC_SITE_IMPORT_TERMINAL_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	isPermanentStaticSiteImportError,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, border, external, lock, published, thumbsDown, thumbsUp } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { getCurrentDashboard } from '../../app/routing';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import SitePreview from '../site-preview';
import type { Site, StaticSiteImportSession } from '@automattic/api-core';

import './style.scss';

export interface StaticSiteImportSearch {
	importSessionId?: string;
	from?: string;
	platform?: string;
	domainChoice?: string;
}

const RESTART_CODES = [
	'static_site_import_session_not_found',
	'static_site_import_preview_expired',
	'static_site_import_archive_mismatch',
];

// The session only reports queued → finished, so the list moves on a timer and never finishes
// its last item before the session does.
const STEP_DURATION = 20000;

const getHost = ( url = '' ) => {
	try {
		const withScheme = /^https?:\/\//i.test( url ) ? url : `https://${ url }`;
		return new URL( withScheme ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
};

function useTimedStep( stepCount: number, isRunning: boolean ) {
	const [ step, setStep ] = useState( 0 );
	useEffect( () => {
		if ( ! isRunning ) {
			return;
		}
		const id = window.setInterval(
			() => setStep( ( current ) => Math.min( current + 1, stepCount - 1 ) ),
			STEP_DURATION
		);
		return () => window.clearInterval( id );
	}, [ isRunning, stepCount ] );
	return step;
}

function MovingChecklist( { session }: { session?: StaticSiteImportSession } ) {
	const summary = Array.isArray( session?.preview_summary ) ? undefined : session?.preview_summary;
	const pages = summary?.pages;
	const items = [
		{
			label: __( 'Pages' ),
			total: pages
				? sprintf( /* translators: %d: number of pages. */ __( '%d pages' ), pages )
				: '',
		},
		{ label: __( 'Images' ) },
		{ label: __( 'Fonts, colors, and layout' ) },
		{ label: __( 'Checking every page against your current site' ) },
	];
	const current = useTimedStep( items.length, true );

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

function Feedback( { siteId, platform }: { siteId: number; platform?: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter } = useHelpCenter();
	const [ vote, setVote ] = useState< 'good' | 'bad' | null >( null );

	const onVote = ( rating: 'good' | 'bad' ) => {
		setVote( rating );
		recordTracksEvent( 'calypso_dashboard_static_site_import_feedback', {
			site_id: siteId,
			platform,
			rating,
		} );
		if ( rating === 'bad' ) {
			setShowHelpCenter( true );
		}
	};

	return (
		<HStack className="static-site-import-card__feedback" wrap>
			<Text weight={ 500 }>{ __( 'Does it look right?' ) }</Text>
			{ vote === 'good' ? (
				<Text>{ __( 'Thanks for the feedback!' ) }</Text>
			) : (
				<HStack justify="flex-end" expanded={ false } wrap>
					<Button
						icon={ thumbsUp }
						iconSize={ 16 }
						size="compact"
						style={ { color: 'var(--dashboard__foreground-color-success)' } }
						onClick={ () => onVote( 'good' ) }
					>
						{ __( 'Looks right' ) }
					</Button>
					<Button
						icon={ thumbsDown }
						iconSize={ 16 }
						size="compact"
						style={ { color: 'var(--dashboard__foreground-color-error)' } }
						onClick={ () => onVote( 'bad' ) }
					>
						{ __( 'Something’s off' ) }
					</Button>
				</HStack>
			) }
		</HStack>
	);
}

function PreviewFrame( { site }: { site: Site } ) {
	const [ resizeListener, { width } ] = useResizeObserver();
	const host = getHost( site.URL );
	const scale = width ? width / 1200 : 0;

	return (
		<div className="static-site-import-card__frame">
			<HStack className="static-site-import-card__frame-bar" spacing={ 2 }>
				<Icon icon={ lock } size={ 18 } />
				<span className="static-site-import-card__frame-url">{ host }</span>
				<span>{ __( 'Private' ) }</span>
			</HStack>
			<div className="static-site-import-card__frame-body">
				{ resizeListener }
				{ !! scale && <SitePreview url={ site.URL } scale={ scale } height={ 400 / scale } /> }
				<Button
					className="static-site-import-card__frame-button"
					variant="secondary"
					href={ site.URL }
					target="_blank"
					rel="noopener noreferrer"
					icon={ external }
					iconPosition="right"
				>
					{ __( 'Open preview' ) }
				</Button>
			</div>
		</div>
	);
}

export default function StaticSiteImportCard( {
	site,
	search,
}: {
	site: Site;
	search: StaticSiteImportSearch & { importSessionId: string };
} ) {
	const { importSessionId: sessionId, from, platform, domainChoice } = search;
	const { setShowHelpCenter } = useHelpCenter();
	const sourceHost = getHost( from );

	const {
		data: session,
		error: sessionError,
		refetch,
	} = useQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		refetchInterval: pollStaticSiteImportSessionUntil( STATIC_SITE_IMPORT_TERMINAL_STATES ),
	} );
	const {
		mutate: approve,
		error: approveError,
		reset: resetApprove,
	} = useMutation( approveStaticSiteImportSessionMutation() );

	// The user asked for the move before checkout; now the site has a plan, start it.
	const hasRequestedApproval = useRef( false );
	useEffect( () => {
		if (
			hasRequestedApproval.current ||
			session?.state !== 'preview_ready' ||
			! session.archive_hash
		) {
			return;
		}
		hasRequestedApproval.current = true;
		approve(
			{ sessionId, archiveHash: session.archive_hash, destinationBlogId: site.ID },
			{ onSettled: () => refetch() }
		);
	}, [ approve, refetch, session, sessionId, site.ID ] );

	const errorCode =
		getStaticSiteImportErrorCode( approveError ) ?? getStaticSiteImportErrorCode( sessionError );
	const needsRestart =
		RESTART_CODES.includes( errorCode ?? '' ) ||
		( session?.state === 'failed' && ! session.site_url );
	const hasFailed =
		needsRestart ||
		session?.state === 'failed' ||
		isPermanentStaticSiteImportError( sessionError ) ||
		( Boolean( approveError ) && errorCode !== 'static_site_import_session_already_approved' );
	const isFinished = session?.state === 'finished';

	const restartUrl = addQueryArgs(
		wpcomLink( '/setup/static-site-import/static-site-import-reading' ),
		{
			from,
			platform,
			siteId: site.ID,
			siteSlug: site.slug,
		}
	);

	const connectDomainUrl = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
		initialQuery: sourceHost,
		siteSlug: site.slug,
		dashboard: getCurrentDashboard(),
		back_to: redirectToDashboardLink(),
	} );

	if ( hasFailed ) {
		const retryApproval = () => {
			resetApprove();
			hasRequestedApproval.current = false;
			refetch();
		};

		return (
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<Heading level={ 2 } size={ 20 } weight={ 600 }>
							{ __( 'We couldn’t finish your move' ) }
						</Heading>
						<Notice variant="error">
							{ errorCode === 'static_site_import_atomic_unavailable'
								? __(
										'Your plan can’t host an imported site yet. Nothing has changed on your current site.'
									)
								: __(
										'Nothing has changed on your current site. You can try again or ask us for help.'
									) }
						</Notice>
						<HStack justify="flex-start" wrap>
							{ needsRestart && (
								<Button __next40pxDefaultSize variant="primary" href={ restartUrl }>
									{ __( 'Read my site again' ) }
								</Button>
							) }
							{ ! needsRestart && approveError && (
								<Button __next40pxDefaultSize variant="primary" onClick={ retryApproval }>
									{ __( 'Try again' ) }
								</Button>
							) }
							<Button
								__next40pxDefaultSize
								variant="secondary"
								onClick={ () => setShowHelpCenter( true ) }
							>
								{ __( 'Get help' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	if ( isFinished ) {
		const keepsDomain = domainChoice === 'keep' && Boolean( sourceHost );

		return (
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<Notice variant="success" title={ __( 'Your site is ready' ) }>
							{ sourceHost
								? sprintf(
										/* translators: %s: the domain of the site that was moved, e.g. example.com. */
										__(
											'%s has been rebuilt on WordPress.com. It stays private until you switch your address over.'
										),
										sourceHost
									)
								: __(
										'Your site has been rebuilt on WordPress.com. It stays private until you launch it.'
									) }
						</Notice>
						<PreviewFrame site={ site } />
						<Feedback siteId={ site.ID } platform={ platform } />
						<HStack justify="flex-start" wrap>
							{ keepsDomain ? (
								<Button __next40pxDefaultSize variant="primary" href={ connectDomainUrl }>
									{ sprintf(
										/* translators: %s: the site's domain, e.g. example.com. */
										__( 'Connect %s' ),
										sourceHost
									) }
								</Button>
							) : (
								site.options?.admin_url && (
									<Button __next40pxDefaultSize variant="primary" href={ site.options.admin_url }>
										{ __( 'Edit your site' ) }
									</Button>
								)
							) }
							<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
								{ __( 'Need a hand? Get help' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		);
	}

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
					<MovingChecklist session={ session } />
					<Notice variant="info">
						{ __( 'You can close this page. We’ll email you when it’s done.' ) }
					</Notice>
				</VStack>
			</CardBody>
		</Card>
	);
}
