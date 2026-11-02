import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, border, external, published } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { getCurrentDashboard } from '../../app/routing';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { getSourceHost } from './use-static-site-import';
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

	const recordClick = ( action: 'connect_domain' | 'preview_site' ) =>
		recordTracksEvent( 'calypso_dashboard_static_site_import_ready_notice_click', {
			...trackingProps,
			action,
		} );

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

	if ( siteImport.status === 'failed' ) {
		const restartUrl = addQueryArgs(
			wpcomLink( '/setup/static-site-import/static-site-import-reading' ),
			{ from, platform, siteId: site.ID, siteSlug: site.slug }
		);

		return (
			<Notice
				variant="error"
				title={ __( 'We couldn’t finish your move' ) }
				actions={
					<HStack justify="flex-start" wrap>
						{ siteImport.needsRestart && (
							<Button variant="link" href={ restartUrl }>
								{ __( 'Read my site again' ) }
							</Button>
						) }
						{ siteImport.retry && (
							<Button variant="link" onClick={ siteImport.retry }>
								{ __( 'Try again' ) }
							</Button>
						) }
						<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
							{ __( 'Get help' ) }
						</Button>
					</HStack>
				}
			>
				{ siteImport.errorCode === 'static_site_import_atomic_unavailable'
					? __(
							'Your plan can’t host an imported site yet. Nothing has changed on your current site.'
						)
					: __(
							'Nothing has changed on your current site. You can try again or ask us for help.'
						) }
			</Notice>
		);
	}

	const connectDomainUrl = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
		initialQuery: sourceHost || undefined,
		siteSlug: site.slug,
		dashboard: getCurrentDashboard(),
		back_to: redirectToDashboardLink(),
	} );

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
								href={ connectDomainUrl }
								onClick={ () => recordClick( 'connect_domain' ) }
							>
								{ sourceHost
									? sprintf(
											/* translators: %s: the site's domain, e.g. example.com. */
											__( 'Connect %s' ),
											sourceHost
										)
									: __( 'Connect domain' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="secondary"
								href={ site.URL }
								target="_blank"
								rel="noopener noreferrer"
								icon={ external }
								iconPosition="right"
								onClick={ () => recordClick( 'preview_site' ) }
							>
								{ __( 'Preview site' ) }
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
