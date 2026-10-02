import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, border, published, thumbsDown, thumbsUp } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
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

// The session only reports queued → finished, so the list moves on a timer and never finishes
// its last item before the session does.
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
				? sprintf( /* translators: %d: number of pages. */ __( '%d pages' ), pages )
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

	if ( vote === 'good' ) {
		return <Text>{ __( 'Thanks for the feedback!' ) }</Text>;
	}

	return (
		<HStack justify="flex-start" expanded={ false } wrap>
			<Text>{ __( 'Does it look right?' ) }</Text>
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
	const { setShowHelpCenter } = useHelpCenter();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { from, platform, domainChoice } = search;
	const sourceHost = getSourceHost( from );

	if ( isDismissed ) {
		return null;
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

	const keepsDomain = domainChoice === 'keep' && Boolean( sourceHost );
	const connectDomainUrl = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
		initialQuery: sourceHost,
		siteSlug: site.slug,
		dashboard: getCurrentDashboard(),
		back_to: redirectToDashboardLink(),
	} );

	return (
		<Notice
			variant="success"
			title={ __( 'Your site is ready' ) }
			onClose={ () => setIsDismissed( true ) }
			actions={
				<HStack justify="space-between" wrap>
					{ keepsDomain && (
						<Button variant="link" href={ connectDomainUrl }>
							{ sprintf(
								/* translators: %s: the site's domain, e.g. example.com. */
								__( 'Connect %s' ),
								sourceHost
							) }
						</Button>
					) }
					<Feedback siteId={ site.ID } platform={ platform } />
				</HStack>
			}
		>
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
	);
}
