import { fetchWordPressMigrationStatus, isWpError } from '@automattic/api-core';
import {
	siteQueryFilter,
	siteWordPressMigrationCancelMutation,
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationStatusQuery,
} from '@automattic/api-queries';
import { invokeSurvicateEventOnce } from '@automattic/survicate';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useHelpCenter } from '../../../app/help-center';
import Notice, { NoticeActionButton } from '../../../components/notice';
import { isSiteMigrationInProgress } from '../../../utils/site-status';
import { MigrationCancellation } from './cancellation';
import { Connect } from './connect';
import { Findings } from './findings';
import { MigrationCard, MigrationFooter, StatusIcon } from './migration-card';
import { Running } from './running';
import type { Site } from '@automattic/api-core';

// How long a completed migration can leave its site locked before we stop asking the user to wait.
const UNLOCK_GRACE_PERIOD = 30000;

// Allow the 30-second duplicate-start window to expire.
const STOPPED_STATUS_REFRESH_DELAY = 35000;

const KNOWN_STATUSES = [
	'not_started',
	'running',
	'paused',
	'failed',
	'completed',
	'cancelled',
	'unlock_failed',
];

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
		// Once our team has the migration, read the site again: its migration state takes this page over.
		queryFn: async () => {
			const status = await fetchWordPressMigrationStatus( site.ID );
			if ( status.handed_off ) {
				await queryClient.refetchQueries( { ...siteQueryFilter( site.ID ), type: 'active' } );
			}
			return status;
		},
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
	const cancel = useMutation( siteWordPressMigrationCancelMutation( site.ID ) );
	const canCancel = ! error && migration?.can_cancel === true;
	const cancelAction = canCancel && (
		<MigrationCancellation disabled={ cancel.isPending } onConfirm={ () => cancel.mutate() } />
	);
	const note = <MigrationFooter site={ site } cancelAction={ cancelAction } />;

	// What's fixed by setting the source up again goes straight back to that step.
	let connectionFailure = undefined;
	if ( migration?.status === 'failed' ) {
		connectionFailure = migration.findings.find(
			( { suggested_action } ) => suggested_action === 'connect_source'
		);
	}

	// A stopped migration can also be taken back to that step, until it's no longer stopped, wherever it was started from.
	const isStopped = migration?.status === 'paused' || migration?.status === 'failed';
	const awaitingCooldown = isStopped && migration.can_cancel === false && ! migration.handed_off;
	useEffect( () => {
		if ( awaitingCooldown ) {
			const timeout = setTimeout( () => refetch(), STOPPED_STATUS_REFRESH_DELAY );
			return () => clearTimeout( timeout );
		}
	}, [ awaitingCooldown, migration?.started_at, refetch, site.ID ] );

	const [ isBackToSetup, setIsBackToSetup ] = useState( false );
	useEffect( () => {
		if ( ! isStopped ) {
			setIsBackToSetup( false );
		}
	}, [ isStopped ] );
	const isConnecting =
		migration?.status === 'not_started' || !! connectionFailure || ( isStopped && isBackToSetup );

	// What stopped the run stays on screen there too, so a connected source doesn't read as nothing having gone wrong.
	const backToSetupFailure =
		isStopped && isBackToSetup
			? migration?.findings.find( ( { severity } ) => severity === 'failure' )
			: undefined;

	// The connect step shows how the source can be connected, so it waits for that before showing at all. It's read
	// alongside the migration, before we know which step that is, and only kept up for the connect step after.
	const { isPending: isConfigurationPending } = useQuery( {
		...siteWordPressMigrationConfigurationQuery( site.ID ),
		enabled: ! migration || isConnecting,
		// The source is connected on its own site, often in another tab, so check again on coming back to this one.
		refetchOnWindowFocus: isConnecting ? 'always' : false,
	} );

	// Each migration asks once, whether it started from this page or was already going when the page opened. A run
	// resumed after a pause is the same migration, so the key is the source rather than when the run started.
	const isRunning = migration?.status === 'running';
	const sourceUrl = migration?.source_url;
	useEffect( () => {
		if ( isRunning && sourceUrl ) {
			return invokeSurvicateEventOnce( 'migrationStarted', `${ site.ID }:${ sourceUrl }` );
		}
	}, [ isRunning, sourceUrl, site.ID ] );

	// The site is unlocked once the migration completes, so hand over to the overview. The router sends a site that
	// still reads as migrating straight back here, so only leave once the site itself says it's done: reload it now,
	// and keep checking in case it lags behind the migration's own status.
	const isCompleted = migration?.status === 'completed';
	const isFinished = isCompleted || migration?.status === 'cancelled';
	const isSiteUnlocked = ! isSiteMigrationInProgress( site );

	// The site should unlock within moments of this page seeing the migration complete. Past that, offer a way out.
	const [ isUnlockOverdue, setIsUnlockOverdue ] = useState( false );
	useEffect( () => {
		if ( ! isFinished ) {
			return;
		}

		const timeout = setTimeout( () => setIsUnlockOverdue( true ), UNLOCK_GRACE_PERIOD );
		return () => {
			clearTimeout( timeout );
			setIsUnlockOverdue( false );
		};
	}, [ isFinished ] );

	useEffect( () => {
		if ( ! isFinished ) {
			return;
		}

		if ( isSiteUnlocked ) {
			navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug: site.slug },
				search: isCompleted ? { migration: 'completed' } : { flash: 'migration-cancelled' },
				replace: true,
			} );
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
	}, [
		isCompleted,
		isFinished,
		isSiteUnlocked,
		isUnlockOverdue,
		queryClient,
		navigate,
		site.ID,
		site.slug,
	] );

	const contactUs = (
		<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
			{ __( 'Contact us' ) }
		</Button>
	);

	const cancelFailed = cancel.isError || cancel.data?.status === 'unlock_failed';

	return (
		<>
			{ cancelFailed && ! isFinished && migration?.status !== 'unlock_failed' && (
				<Notice
					variant="error"
					actions={ isConnecting ? contactUs : undefined }
					onClose={ () => cancel.reset() }
				>
					{ __( 'We couldn’t cancel your migration.' ) }
				</Notice>
			) }
			{ isUnreadable && ! isForbidden && (
				<Notice
					variant="error"
					actions={
						<>
							<NoticeActionButton variant="solid" onClick={ () => refetch() }>
								{ __( 'Try again' ) }
							</NoticeActionButton>
							{ contactUs }
						</>
					}
				>
					{ __( 'We couldn’t load your migration. We’ll keep trying.' ) }
				</Notice>
			) }
			{ /* Only the site's administrators can read the migration. */ }
			{ isForbidden && (
				<MigrationCard
					title={ __( 'A migration to this site is underway' ) }
					description={ __( 'An administrator of this site can follow and manage it here.' ) }
					decoration={ <StatusIcon status="pending" /> }
					actions={ contactUs }
				/>
			) }
			{ isConnecting && isConfigurationPending && cancelAction }
			{ isConnecting && ! isConfigurationPending && (
				<Connect
					note={ note }
					site={ site }
					sourceHost={ sourceHost }
					failure={ connectionFailure ?? backToSetupFailure }
				/>
			) }
			{ migration?.status === 'running' && (
				<Running
					phase={ migration.phase }
					progress={ migration.progress }
					sourceHost={ sourceHost }
					notificationEmails={ migration.notification_emails }
				/>
			) }
			{ migration && isStopped && ! isConnecting && (
				<Findings
					note={ note }
					site={ site }
					migration={ migration }
					onBackToSetup={ () => {
						// It isn't kept up while the run is going, and the source may have changed since.
						queryClient.invalidateQueries( {
							queryKey: siteWordPressMigrationConfigurationQuery( site.ID ).queryKey,
						} );
						setIsBackToSetup( true );
					} }
				/>
			) }
			{ migration?.status === 'unlock_failed' && (
				<MigrationCard
					title={ __( 'We couldn’t cancel your migration' ) }
					description={ __( 'Contact support for help cancelling your migration.' ) }
					decoration={ <StatusIcon status="error" /> }
					actions={ contactUs }
				/>
			) }
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
		</>
	);
}

function getSourceHost( sourceUrl?: string | null ) {
	try {
		return new URL( sourceUrl ?? '' ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
}
