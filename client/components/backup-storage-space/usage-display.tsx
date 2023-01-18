import { Gridicon, ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import {
	getRewindBytesAvailable,
	getRewindBytesUsed,
	getRewindDaysOfBackupsSaved,
} from 'calypso/state/rewind/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useDaysOfBackupsSavedText, useStorageUsageText } from './hooks';
import StorageHelpTooltip from './storage-usage-help-tooltip';
import { StorageUsageLevelName, StorageUsageLevels } from './storage-usage-levels';

const PROGRESS_BAR_CLASS_NAMES = {
	[ StorageUsageLevels.Full ]: 'full-warning',
	[ StorageUsageLevels.Critical ]: 'red-warning',
	[ StorageUsageLevels.Warning ]: 'yellow-warning',
	[ StorageUsageLevels.Normal ]: 'no-warning',
	[ StorageUsageLevels.BackupsDiscarded ]: 'red-warning',
};

type OwnProps = {
	loading?: boolean;
	usageLevel: StorageUsageLevelName;
};

const UsageDisplay: React.FC< OwnProps > = ( { loading = false, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const translate = useTranslate();

	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const storageUsageText = useStorageUsageText( bytesUsed, bytesAvailable );
	const daysOfBackupsSaved = useSelector( ( state ) =>
		getRewindDaysOfBackupsSaved( state, siteId )
	);
	const daysOfBackupsSavedText = useDaysOfBackupsSavedText( daysOfBackupsSaved, siteSlug );
	const loadingText = translate( 'Calculating…', {
		comment: 'Loading text displayed while storage usage is being calculated',
	} );

	return (
		<div
			className={ classnames( 'backup-storage-space__progress-bar-container', {
				'is-loading': loading,
			} ) }
		>
			<div className="backup-storage-space__progress-heading">
				<span hidden={ StorageUsageLevels.Full !== usageLevel }>
					<Gridicon className="backup-storage-space__storage-full-icon" icon="notice" size={ 24 } />
				</span>
				<span>{ translate( 'Cloud storage space' ) } </span>
				<StorageHelpTooltip
					className="backup-storage-space__help-tooltip"
					bytesAvailable={ bytesAvailable }
				/>
			</div>
			<div className="backup-storage-space__progress-bar">
				<ProgressBar
					className={ PROGRESS_BAR_CLASS_NAMES[ usageLevel ] }
					value={ bytesUsed ?? 0 }
					total={ bytesAvailable ?? Infinity }
				/>
			</div>
			<div className="backup-storage-space__progress-usage-container">
				<div
					className={ classnames( 'backup-storage-space__progress-storage-usage-text', {
						'is-storage-full': StorageUsageLevels.Full === usageLevel,
					} ) }
				>
					{ loading ? loadingText : storageUsageText }
				</div>
				<div className="backup-storage-space__progress-backups-saved-text">
					{ ! loading && daysOfBackupsSavedText }
				</div>
			</div>
		</div>
	);
};

export default UsageDisplay;
