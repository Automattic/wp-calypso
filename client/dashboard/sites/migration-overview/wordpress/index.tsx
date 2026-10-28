import { isWpError } from '@automattic/api-core';
import { siteQueryFilter, siteWordPressMigrationStatusQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useHelpCenter } from '../../../app/help-center';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { getSiteDisplayName } from '../../../utils/site-name';
import { isSiteMigrationInProgress } from '../../../utils/site-status';
import { Connect } from './connect';
import { Findings } from './findings';
import { MigrationCard, StatusIcon } from './migration-card';
import { Running } from './running';
import type { Site } from '@automattic/api-core';

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
			header={ <PageHeader title={ getSiteDisplayName( site ) } /> }
		>
			{ /* Only the site's administrators can read the migration. */ }
			{ isForbidden && (
				<MigrationCard
					title={ __( 'A migration to this site is underway' ) }
					description={ __( 'An administrator of this site can follow and manage it here.' ) }
					decoration={ <StatusIcon status="pending" /> }
					actions={ contactUs }
				/>
			) }
			{ ( migration?.status === 'not_started' || connectionFailure ) && (
				<Connect site={ site } failure={ connectionFailure } />
			) }
			{ migration?.status === 'running' && (
				<Running
					phase={ migration.phase }
					sourceHost={ sourceHost }
					notificationEmails={ migration.notification_emails }
				/>
			) }
			{ ( migration?.status === 'paused' || migration?.status === 'failed' ) &&
				! connectionFailure && <Findings site={ site } migration={ migration } /> }
			{ isCompleted && (
				<MigrationCard
					title={ __( 'Your site has been migrated' ) }
					decoration={ <StatusIcon status="success" /> }
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
				<MigrationCard
					title={ __( 'Your site is being migrated' ) }
					decoration={ <StatusIcon status="pending" /> }
					actions={ contactUs }
				/>
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
