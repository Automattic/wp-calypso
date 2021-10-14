import { ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
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
	loading?: boolean;
	usageLevel: StorageUsageLevels;
};

const UsageDisplay: React.FC< OwnProps > = ( { loading = false, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const translate = useTranslate();

	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const storageUsageText = useStorageUsageText( bytesUsed, bytesAvailable );
	const loadingText = translate( 'Calculating…', {
		comment: 'Loading text displayed while storage usage is being calculated',
	} );

	return (
		<div
			className={ classnames( 'backup-storage-space__progress-bar-container', {
				'is-loading': loading,
			} ) }
		>
			<div className="backup-storage-space__progress-heading">{ translate( 'Storage space' ) }</div>
			<div className="backup-storage-space__progress-bar">
				<ProgressBar
					className={ PROGRESS_BAR_CLASS_NAMES[ usageLevel ] }
					value={ bytesUsed ?? 0 }
					total={ bytesAvailable ?? Infinity }
				/>
			</div>
			<div className="backup-storage-space__progress-usage-text">
				{ loading ? loadingText : storageUsageText }
			</div>
		</div>
	);
};

export default UsageDisplay;
