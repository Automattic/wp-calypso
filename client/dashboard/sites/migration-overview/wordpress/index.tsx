import { isWpError } from '@automattic/api-core';
import { siteQueryFilter, siteWordPressMigrationStatusQuery } from '@automattic/api-queries';
import { invokeSurvicateEvent } from '@automattic/survicate';
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
import { Connect } from './connect';
import { Findings } from './findings';
import { MigrationCard } from './migration-card';
import { Running } from './running';
import type { Site, WordPressMigrationStatus } from '@automattic/api-core';

// How long a completed migration can leave its site locked before we stop asking the user to wait.
const UNLOCK_GRACE_PERIOD = 30000;

const KNOWN_STATUSES = [ 'not_started', 'running', 'paused', 'failed', 'completed' ];

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
			const status = state.data?.status;
			if ( status === 'running' ) {
				return 5000;
			}

			// Keep trying while it can't be read: access to the site can drop out and come back mid-migration.
			// And keep an eye on a status this page doesn't know, which may be on its way to one it does.
			return state.error || ( status && ! KNOWN_STATUSES.includes( status ) ) ? 30000 : false;
		},
	} );

	// Whatever was last read stays on screen through a failed refresh, so these only cover a migration never read.
	const isUnreadable = ! migration && !! error;
	const isForbidden = isUnreadable && isWpError( error ) && error.statusCode === 403;
	const sourceHost = getSourceHost( migration?.source_url );

	// Only connecting the source again gets past a refused connection, so go straight back to that step.
	const connectionFailure =
		migration?.status === 'failed'
			? migration.findings.find( ( { code } ) => code === 'source_connection_failed' )
			: undefined;

	// The site is unlocked once the migration completes, so hand over to the overview. The router sends a site that
	// still reads as migrating straight back here, so only leave once the site itself says it's done: reload it now,
	// and keep checking in case it lags behind the migration's own status.
	const isCompleted = migration?.status === 'completed';
	const isSiteUnlocked = ! isSiteMigrationInProgress( site );

	useEffect( () => {
		if ( isCompleted ) {
			return invokeSurvicateEvent( 'migrationCompleted' );
		}
	}, [ isCompleted ] );

	// The site should unlock within moments of this page seeing the migration complete. Past that, offer a way out.
	const [ isUnlockOverdue, setIsUnlockOverdue ] = useState( false );
	useEffect( () => {
		if ( ! isCompleted ) {
			return;
		}

		const timeout = setTimeout( () => setIsUnlockOverdue( true ), UNLOCK_GRACE_PERIOD );
		return () => {
			clearTimeout( timeout );
			setIsUnlockOverdue( false );
		};
	}, [ isCompleted ] );

	useEffect( () => {
		if ( ! isCompleted ) {
			return;
		}

		if ( isSiteUnlocked ) {
			navigate( { to: '/sites/$siteSlug', params: { siteSlug: site.slug }, replace: true } );
			return;
		}

		const reloadSite = () => {
			if ( ! document.hidden ) {
				queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
			}
		};
		reloadSite();
		const interval = setInterval( reloadSite, isUnlockOverdue ? 30000 : 5000 );
		return () => clearInterval( interval );
	}, [ isCompleted, isSiteUnlocked, isUnlockOverdue, queryClient, navigate, site.ID, site.slug ] );

	const contactUs = (
		<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
			{ __( 'Contact us' ) }
		</Button>
	);

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
								<Button __next40pxDefaultSize variant="primary" onClick={ () => refetch() }>
									{ __( 'Try again' ) }
								</Button>
								{ contactUs }
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
									<Text variant="muted">
										{ getSummary(
											connectionFailure ? 'not_started' : migration.status,
											sourceHost
										) }
									</Text>
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
			{ ( migration?.status === 'not_started' || connectionFailure ) && (
				<Connect site={ site } failure={ connectionFailure } />
			) }
			{ migration?.status === 'running' && (
				<Running phase={ migration.phase } sourceHost={ sourceHost } />
			) }
			{ ( migration?.status === 'paused' || migration?.status === 'failed' ) &&
				! connectionFailure && <Findings site={ site } migration={ migration } /> }
			{ isCompleted && (
				<MigrationCard
					title={ __( 'Your site has been migrated' ) }
					description={
						isUnlockOverdue
							? __( 'Loading your site is taking longer than it should.' )
							: __( 'One moment while we finish up and load your site.' )
					}
					actions={
						isUnlockOverdue && (
							<>
								<Button
									__next40pxDefaultSize
									variant="primary"
									onClick={ () => window.location.reload() }
								>
									{ __( 'Reload' ) }
								</Button>
								{ contactUs }
							</>
						)
					}
				/>
			) }
			{ /* A status this page doesn't know yet. */ }
			{ migration && ! KNOWN_STATUSES.includes( migration.status ) && (
				<MigrationCard title={ __( 'Your site is being migrated' ) } actions={ contactUs } />
			) }
		</PageLayout>
	);
}

function getSourceHost( sourceUrl?: string | null ) {
	try {
		return new URL( sourceUrl ?? '' ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
}

// The line after the site's address in the header, e.g. "example.wordpress.com · waiting for access to example.com".
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
		case 'completed':
			/* translators: %s: the domain of the site that was migrated, e.g. example.com. */
			return sprintf( __( 'migrated from %s' ), sourceHost );
		default:
			/* translators: %s: the domain of the site being migrated, e.g. example.com. */
			return sprintf( __( 'migrating from %s' ), sourceHost );
	}
}
