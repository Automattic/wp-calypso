import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { isSuccessfulRealtimeBackup } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { urlToSlug } from 'calypso/lib/url';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { useDashboardAddRemoveLicense } from '../../hooks';
import { DASHBOARD_LICENSE_TYPES, getExtractedBackupTitle } from '../utils';
import ExpandedCard from './expanded-card';
import type { Site, Backup } from '../types';

interface Props {
	site: Site;
	trackEvent: ( eventName: string ) => void;
}

const BACKUP_ERROR_STATUSES = [ 'rewind_backup_error', 'backup_only_error' ];

const BackupStorageContent = ( {
	siteId,
	siteUrl,
	trackEvent,
}: {
	siteId: number;
	siteUrl: string;
	trackEvent: ( eventName: string ) => void;
} ) => {
	const translate = useTranslate();

	const moment = useLocalizedMoment();
	const endDate = useDateWithOffset( moment().endOf( 'day' ) );
	const startDate = useDateWithOffset( moment().subtract( 1, 'day' ).startOf( 'day' ) );

	const { isLoading, data } = useRewindableActivityLogQuery(
		siteId,
		{
			after: startDate?.toISOString() ?? undefined,
			before: endDate?.toISOString() ?? undefined,
		},
		{
			select: ( backups: Backup[] ) =>
				backups.filter( ( backup ) => isSuccessfulRealtimeBackup( backup ) ),
		}
	);

	const backup = data?.[ 0 ] ?? null;

	const lastBackupDate = useDateWithOffset( backup?.activityTs );
	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( lastBackupDate, false );

	// Show plugin name only if it is a activity from a plugin
	const pluginName =
		backup?.activityName.startsWith( 'plugin__' ) && backup.activityDescription[ 0 ]?.children[ 0 ];

	const showLoader = isLoading || ! backup;

	return (
		<div className="site-expanded-content__card-content-container">
			<div className="site-expanded-content__card-content">
				<div className="site-expanded-content__card-content-column">
					<div className="site-expanded-content__card-content-score">
						{ showLoader ? <TextPlaceholder /> : displayDate }
					</div>
					<div className="site-expanded-content__card-content-score-title">
						{ showLoader ? (
							<TextPlaceholder />
						) : (
							<>
								{ getExtractedBackupTitle( backup ) }
								{ pluginName ? ` - ${ pluginName }` : '' }
							</>
						) }
					</div>
				</div>
			</div>
			<div className="site-expanded-content__card-footer">
				<Button
					onClick={ () => trackEvent( 'expandable_block_activity_log_click' ) }
					href={ `/activity-log/${ siteUrl }` }
					className="site-expanded-content__card-button"
					compact
				>
					{ translate( 'Activity log' ) }
				</Button>
			</div>
		</div>
	);
};

export default function BackupStorage( { site, trackEvent }: Props ) {
	const {
		blog_id: siteId,
		url: siteUrl,
		latest_backup_status: backupStatus,
		has_backup: hasBackup,
	} = site;

	const translate = useTranslate();

	const hasBackupError = BACKUP_ERROR_STATUSES.includes( backupStatus );

	const components = {
		strong: <strong></strong>,
	};

	const isBackupEnabled = ! hasBackupError && hasBackup;

	const siteUrlWithMultiSiteSupport = urlToSlug( siteUrl );
	// If the backup has an error, we want to redirect the user to the backup page
	const link = hasBackupError ? `/backup/${ siteUrlWithMultiSiteSupport }` : '';

	const { isLicenseSelected, handleAddLicenseAction } = useDashboardAddRemoveLicense(
		siteId,
		DASHBOARD_LICENSE_TYPES.BACKUP
	);

	const addBackupText = isLicenseSelected ? (
		<span className="site-expanded-content__license-selected">
			<Gridicon icon="checkmark" size={ 16 } />
			{ translate( 'Backup Selected' ) }
		</span>
	) : (
		translate( 'Add {{strong}}Backup{{/strong}} to see your backup', {
			components,
		} )
	);

	const handleTrackEvent = () => {
		let trackName;
		if ( hasBackupError ) {
			trackName = 'expandable_block_backup_error_click';
		} else if ( ! hasBackup ) {
			trackName = isLicenseSelected
				? 'expandable_block_backup_remove_click'
				: 'expandable_block_backup_add_click';
		}
		if ( trackName ) {
			return trackEvent( trackName );
		}
	};

	const handleOnClick = () => {
		handleTrackEvent();
		// If the backup is not enabled, we want to add the license
		if ( ! hasBackup ) {
			handleAddLicenseAction();
		}
	};

	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	// If the site is a multisite and doesn't already have a backup, we want to show a message that the backup is not supported
	if ( isMultiSite && ! hasBackup ) {
		return (
			<ExpandedCard
				isEnabled={ false }
				emptyContent={ translate( 'Backup not supported on multisite' ) }
			/>
		);
	}

	return (
		<ExpandedCard
			header={ translate( 'Latest backup' ) }
			isEnabled={ isBackupEnabled }
			emptyContent={
				hasBackupError
					? translate( 'Fix {{strong}}Backup{{/strong}} connection to see your backup storage', {
							components,
					  } )
					: addBackupText
			}
			// If the backup is not enabled, we want to allow the user to click on the card
			onClick={ ! isBackupEnabled ? handleOnClick : undefined }
			href={ link }
		>
			{ isBackupEnabled && (
				<BackupStorageContent
					siteId={ site.blog_id }
					siteUrl={ site.url }
					trackEvent={ trackEvent }
				/>
			) }
		</ExpandedCard>
	);
}
