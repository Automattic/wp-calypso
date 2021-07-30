/**
 * External Dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { EVERY_SECOND, Interval } from 'calypso/lib/interval';
import { ProgressBar } from '@automattic/components';

type Props = {
	siteId: number;
	isStandalone: boolean;
};

const JetpackBenefitsSiteBackups: React.FC< Props > = ( { siteId, isStandalone } ) => {
	const backups = useSelector( ( state ) => {
		return getRewindBackups( state, siteId );
	} );

	const dispatch = useDispatch();
	const refreshBackupProgress = useCallback( () => dispatch( requestRewindBackups( siteId ) ), [
		dispatch,
		siteId,
	] );

	const loadingBackups = backups === null; // getRewindBackups returns null if there are no backups for the siteId

	const backupCurrentlyInProgress = useSelector( ( state ) => {
		return getInProgressBackupForSite( state, siteId );
	} );

	const getBackupTimeAgo = ( backup: { last_updated: string } ) => {
		return moment.utc( backup.last_updated ).fromNow();
	};

	const getPostCountForBackup = ( backup ) => {
		const stats = backup.stats;
		return (
			stats.tables[ stats.prefix + 'posts' ].post_published ??
			stats.tables[ stats.prefix + 'posts' ].published
		);
	};

	const getStatForBackup = ( backup, statName: string ) => {
		const stats = backup.stats;
		return stats[ statName ] ? stats[ statName ].count : 0;
	};

	// if still loading, show a loading state
	if ( loadingBackups ) {
		return (
			<React.Fragment>
				<JetpackBenefitsCard
					jestMarker="loading-backups" // for test suite
					headline="Site Backups"
					description="Loading backup data"
					stat="Placeholder"
					placeholder={ true }
				/>
			</React.Fragment>
		);
	}

	// If a backup is in progress,
	// start tracking and showing progress
	if ( backupCurrentlyInProgress ) {
		return (
			<>
				<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
				<JetpackBenefitsCard
					headline="Site Backups"
					description={
						<ProgressBar
							value={ backupCurrentlyInProgress.percent }
							total={ 100 }
							color="#069E08"
						/>
					}
					stat="In Progress"
				/>
			</>
		);
	}

	// now that backups are loaded and any in progress are complete, get the most recent one
	const mostRecentBackup = backups.length > 0 ? backups[ 0 ] : null;

	// no backups taken yet
	if ( ! mostRecentBackup ) {
		return (
			<JetpackBenefitsCard
				jestMarker="no-backups" // for test suite
				headline="Site Backups"
				description="Jetpack will back up your site soon."
			/>
		);
	}

	// most recent backup was not successful
	if ( mostRecentBackup.status !== 'finished' && mostRecentBackup.status !== 'started' ) {
		return (
			<JetpackBenefitsCard
				jestMarker="recent-backup-error" // for test suite
				headline="Site Backups"
				description="Jetpack's last attempt to back up your site was not successful. Please contact Jetpack support."
				stat="Error"
			/>
		);
	}

	const lastBackupTimeAgo = getBackupTimeAgo( mostRecentBackup );
	if ( isStandalone ) {
		return (
			<JetpackBenefitsStandaloneCard
				title="Site Backups"
				summary={ {
					title: 'Last Backup',
					stat: lastBackupTimeAgo,
				} }
				stats={ [
					{
						title: 'Posts',
						stat: getPostCountForBackup( mostRecentBackup ),
					},
					{
						title: 'Uploads',
						stat: getStatForBackup( mostRecentBackup, 'uploads' ),
					},
					{
						title: 'Plugins',
						stat: getStatForBackup( mostRecentBackup, 'plugins' ),
					},
				] }
			/>
		);
	}

	return (
		<JetpackBenefitsCard
			jestMarker="default-backup-output" // for test suite
			headline="Site Backups"
			description="Your latest site backups."
			stat={ lastBackupTimeAgo }
		/>
	);
};

export default ( props: Props ) => {
	return (
		<React.Fragment>
			<QueryRewindBackups siteId={ props.siteId } />
			<JetpackBenefitsSiteBackups { ...props } />
		</React.Fragment>
	);
};
