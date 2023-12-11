import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { isSuccessfulRealtimeBackup } from 'calypso/lib/jetpack/backup-utils';
import useDateOffsetForSite from 'calypso/lib/jetpack/hooks/use-date-offset-for-site';
import { urlToSlug } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import ExpandedCard from './expanded-card';
import useDashboardAddRemoveLicense from './hooks/use-dashboard-add-remove-license';
import useExtractedBackupTitle from './hooks/use-extracted-backup-title';
import type { Site, Backup } from '../types';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Moment } from 'moment';

interface Props {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError: boolean;
}

const BACKUP_ERROR_STATUSES = [ 'rewind_backup_error', 'backup_only_error' ];

const BackupStorageContent = ( {
	siteId,
	siteUrl,
	isAtomicSite,
	trackEvent,
}: {
	siteId: number;
	siteUrl: string;
	trackEvent: ( eventName: string ) => void;
	isAtomicSite?: boolean;
} ) => {
	const translate = useTranslate();

	const moment = useLocalizedMoment();
	const endDate = useDateOffsetForSite( moment().endOf( 'day' ), siteId );
	const startDate = useDateOffsetForSite( moment().subtract( 1, 'day' ).startOf( 'day' ), siteId );

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
	) as UseQueryResult< Backup[] >;

	const backup = data?.[ 0 ] ?? null;

	const lastBackupDate = useDateOffsetForSite(
		backup?.activityTs as Moment | undefined | null,
		siteId
	);
	// Ignore type checking because TypeScript is incorrectly inferring the prop type due to .js usage in use-get-display-date
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const getDisplayDate = useGetDisplayDate( siteId );
	const displayDate = getDisplayDate( lastBackupDate, false );

	// Show plugin name only if it is a activity from a plugin
	const pluginName =
		backup?.activityName.startsWith( 'plugin__' ) &&
		backup.activityDescription?.[ 0 ]?.children?.[ 0 ];

	const showLoader = isLoading || ! backup;
	const extractedBackupTitle = useExtractedBackupTitle( backup );

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
								{ extractedBackupTitle }
								{ pluginName ? ` - ${ pluginName }` : '' }
							</>
						) }
					</div>
				</div>
			</div>
			<div className="site-expanded-content__card-footer">
				<Button
					onClick={ () => trackEvent( 'expandable_block_activity_log_click' ) }
					href={
						isAtomicSite
							? `https://wordpress.com/activity-log/${ urlToSlug( siteUrl ) }`
							: `/activity-log/${ urlToSlug( siteUrl ) }`
					}
					target={ isAtomicSite ? '_blank' : undefined }
					className="site-expanded-content__card-button"
					compact
				>
					{ translate( 'Activity log' ) } { isAtomicSite && <Gridicon icon="external" /> }
				</Button>
			</div>
		</div>
	);
};

export default function BackupStorage( { site, trackEvent, hasError }: Props ) {
	const {
		blog_id: siteId,
		url: siteUrl,
		latest_backup_status: backupStatus,
		has_backup: hasBackup,
	} = site;

	const translate = useTranslate();

	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

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
		'backup'
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

	// If the user cannot issue licenses, and doesn't already have one, we have nothing to show
	if ( ! isLicenseSelected && ! partnerCanIssueLicense ) {
		return null;
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
			hasError={ hasError }
		>
			{ isBackupEnabled && (
				<BackupStorageContent
					siteId={ site.blog_id }
					siteUrl={ site.url }
					isAtomicSite={ site.is_atomic }
					trackEvent={ trackEvent }
				/>
			) }
		</ExpandedCard>
	);
}
