import { isWpError } from '@automattic/api-core';
import { siteQueryFilter, siteWordPressMigrationStatusQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useHelpCenter } from '../../../app/help-center';
import { MetadataItem, MetadataList } from '../../../components/metadata-list';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';
import { getSiteDisplayName } from '../../../utils/site-name';
import { isSiteMigrationInProgress } from '../../../utils/site-status';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import { getSourceHost } from '../../overview-static-site-import/use-static-site-import';
import { Connect } from './connect';
import { Findings } from './findings';
import { MigrationCard } from './migration-card';
import { Running } from './running';
import type { Site, WordPressMigrationStatus } from '@automattic/api-core';

export function WordPressMigration( { site }: { site: Site } ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { setShowHelpCenter } = useHelpCenter();
	const {
		data: migration,
		error,
		refetch,
	} = useQuery( {
		...siteWordPressMigrationStatusQuery( site.ID ),
		refetchInterval: ( { state } ) => {
			// Keep trying while it can't be read: access to the site can drop out and come back mid-migration.
			if ( state.error ) {
				return 30000;
			}
			return state.data?.status === 'running' ? 5000 : false;
		},
	} );

	// Whatever was last read stays on screen through a failed refresh, so these only cover a migration never read.
	const isUnreadable = ! migration && !! error;
	const isForbidden = isUnreadable && isWpError( error ) && error.statusCode === 403;
	const sourceHost = getSourceHost( migration?.source_url ?? undefined );

	// Going back to connect the source is remembered against the run that failed, so the next run starts clean.
	const [ reconnectingRun, setReconnectingRun ] = useState< string | null >();
	const isReconnecting = migration?.status === 'failed' && reconnectingRun === migration.started_at;

	// The site is unlocked once the migration completes, so hand over to the overview. The router sends a site that
	// still reads as migrating straight back here, so only leave once the site itself says it's done: reload it now,
	// and keep checking in case it lags behind the migration's own status.
	const isCompleted = migration?.status === 'completed';
	const isSiteUnlocked = ! isSiteMigrationInProgress( site );
	useEffect( () => {
		if ( ! isCompleted ) {
			return;
		}

		if ( isSiteUnlocked ) {
			navigate( { to: '/sites/$siteSlug', params: { siteSlug: site.slug }, replace: true } );
			return;
		}

		const reloadSite = () => queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
		reloadSite();
		const interval = setInterval( reloadSite, 5000 );
		return () => clearInterval( interval );
	}, [ isCompleted, isSiteUnlocked, queryClient, navigate, site.ID, site.slug ] );

	return (
		<PageLayout
			size="small"
			notices={
				isUnreadable &&
				! isForbidden && (
					<Notice
						variant="error"
						actions={
							<>
								<Button variant="primary" onClick={ () => refetch() }>
									{ __( 'Try again' ) }
								</Button>
								<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
									{ __( 'Contact us' ) }
								</Button>
							</>
						}
					>
						{ __( 'We couldn’t load your migration. We’ll keep trying.' ) }
					</Notice>
				)
			}
			header={
				<PageHeader
					title={ getSiteDisplayName( site ) }
					description={
						<MetadataList>
							<MetadataItem>
								<ExternalLink href={ site.URL }>{ getSiteDisplayUrl( site ) }</ExternalLink>
							</MetadataItem>
							{ migration && sourceHost && (
								<MetadataItem>
									<Text variant="muted">{ getSummary( migration.status, sourceHost ) }</Text>
								</MetadataItem>
							) }
						</MetadataList>
					}
				/>
			}
		>
			{ /* Only the site's administrators can read the migration. */ }
			{ isForbidden && (
				<MigrationCard
					title={ __( 'A migration to this site is underway' ) }
					description={ __( 'An administrator of this site can follow and manage it here.' ) }
				/>
			) }
			{ ( migration?.status === 'not_started' || isReconnecting ) && <Connect site={ site } /> }
			{ migration?.status === 'running' && (
				<Running phase={ migration.phase } sourceHost={ sourceHost } />
			) }
			{ ( migration?.status === 'paused' || migration?.status === 'failed' ) &&
				! isReconnecting && (
					<Findings
						site={ site }
						migration={ migration }
						onReconnect={ () => setReconnectingRun( migration.started_at ) }
					/>
				) }
			{ isCompleted && (
				<MigrationCard
					title={ __( 'Your site has been migrated' ) }
					description={ __( 'One moment while we finish up and load your site.' ) }
				/>
			) }
		</PageLayout>
	);
}

function getSummary( status: WordPressMigrationStatus[ 'status' ], sourceHost: string ) {
	switch ( status ) {
		case 'not_started':
			/* translators: %s: the domain of the site being migrated, e.g. example.com. */
			return sprintf( __( 'waiting for access to %s' ), sourceHost );
		case 'paused':
			/* translators: %s: the domain of the site being migrated, e.g. example.com. */
			return sprintf( __( 'checking %s before the migration' ), sourceHost );
		case 'failed':
			/* translators: %s: the domain of the site being migrated, e.g. example.com. */
			return sprintf( __( 'the migration from %s stopped' ), sourceHost );
		default:
			/* translators: %s: the domain of the site being migrated, e.g. example.com. */
			return sprintf( __( 'migrating from %s' ), sourceHost );
	}
}
