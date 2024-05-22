import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import * as React from 'react';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { EVERY_SECOND, Interval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { getSiteSlug } from 'calypso/state/sites/selectors';

interface Props {
	siteId: number;
	isStandalone: boolean;
}

interface Backup {
	stats: {
		prefix: string;
		tables: {
			[ key: string ]: {
				post_published: string;
				published: string;
			};
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[ key: string ]: any;
	};
}

const JetpackBenefitsSiteBackups: React.FC< Props > = ( { siteId, isStandalone } ) => {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const backups = useSelector( ( state ) => getRewindBackups( state, siteId ) );

	const dispatch = useDispatch();
	const refreshBackupProgress = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);

	const loadingBackups = backups === null; // getRewindBackups returns null if there are no backups for the siteId
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const getBackupTimeAgo = ( backup: { last_updated: string } ) => {
		return moment.utc( backup.last_updated ).fromNow();
	};

	const getPostCountForBackup = ( backup: Backup ) => {
		const stats = backup.stats;
		return (
			stats.tables[ stats.prefix + 'posts' ].post_published ??
			stats.tables[ stats.prefix + 'posts' ].published
		);
	};

	const getStatForBackup = ( backup: Backup, statName: string ) => {
		const stats = backup.stats;
		return stats[ statName ] ? stats[ statName ].count : 0;
	};

	// if still loading, show a loading state
	if ( loadingBackups ) {
		return (
			<React.Fragment>
				<JetpackBenefitsCard
					headline={ translate( 'Site Backups' ) }
					description={ translate( 'Loading backup data' ) }
					stat={ translate( 'Placeholder' ) }
					placeholder
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
					headline={ translate( 'Site Backups' ) }
					description={
						<ProgressBar
							value={ backupCurrentlyInProgress.percent }
							total={ 100 }
							color="#069E08"
						/>
					}
					stat={ translate( 'In Progress' ) }
				/>
			</>
		);
	}

	// now that backups are loaded and any in progress are complete, get the most recent one
	const mostRecentBackup = backups?.[ 0 ] || null;

	// License is not attached to a site yet
	if ( ! siteSlug ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Backups' ) }
				description={ translate( 'License key awaiting activation' ) }
			/>
		);
	}

	// no backups taken yet
	if ( ! mostRecentBackup ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Backups' ) }
				description={ translate( 'Jetpack will back up your site soon.' ) }
			/>
		);
	}

	// most recent backup was not successful
	if ( mostRecentBackup.status !== 'finished' && mostRecentBackup.status !== 'started' ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Backups' ) }
				description={ translate(
					"Jetpack's last attempt to back up your site was not successful. Please contact Jetpack support."
				) }
				stat="Error"
			/>
		);
	}

	const lastBackupTimeAgo = getBackupTimeAgo( mostRecentBackup );
	if ( isStandalone ) {
		return (
			<JetpackBenefitsStandaloneCard
				title={ translate( 'Site Backups' ) }
				summary={ {
					title: translate( 'Last Backup' ),
					stat: lastBackupTimeAgo,
				} }
				stats={ [
					{
						title: translate( 'Posts' ),
						stat: getPostCountForBackup( mostRecentBackup ),
					},
					{
						title: translate( 'Uploads' ),
						stat: getStatForBackup( mostRecentBackup, 'uploads' ),
					},
					{
						title: translate( 'Plugins' ),
						stat: getStatForBackup( mostRecentBackup, 'plugins' ),
					},
				] }
			/>
		);
	}

	return (
		<JetpackBenefitsCard
			headline={ translate( 'Site Backups' ) }
			description={ translate( 'Your latest site backup.' ) }
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
