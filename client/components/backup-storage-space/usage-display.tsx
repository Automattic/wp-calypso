import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import { getRewindBytesAvailable, getRewindBytesUsed } from 'calypso/state/rewind/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useStorageUsageText } from './hooks';
import { StorageUsageLevels } from './storage-usage-levels';

const PROGRESS_BAR_CLASS_NAMES = {
	[ StorageUsageLevels.Full ]: 'red-warning',
	[ StorageUsageLevels.Critical ]: 'red-warning',
	[ StorageUsageLevels.Warning ]: 'yellow-warning',
	[ StorageUsageLevels.Normal ]: 'no-warning',
};

type OwnProps = {
	usageLevel: StorageUsageLevels;
};

const UsageDisplay: React.FC< OwnProps > = ( { usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const translate = useTranslate();

	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const storageUsageText = useStorageUsageText( bytesUsed, bytesAvailable );

	if ( bytesUsed === undefined ) {
		return null;
	}

	return (
		<div className="backup-storage-space__progress-bar-container">
			<div className="backup-storage-space__progress-heading">{ translate( 'Storage space' ) }</div>
			<div className="backup-storage-space__progress-bar">
				<ProgressBar
					className={ PROGRESS_BAR_CLASS_NAMES[ usageLevel ] }
					value={ bytesUsed }
					total={ bytesAvailable ?? Infinity }
				/>
			</div>
			<div className="backup-storage-space__progress-usage-text">{ storageUsageText }</div>
		</div>
	);
};

export default UsageDisplay;
