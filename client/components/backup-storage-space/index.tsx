import { Card } from '@automattic/components';
import * as React from 'react';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getRewindBytesAvailable,
	getRewindBytesUsed,
	isRequestingRewindSize,
	getActivityLogVisibleDays,
	getRewindMinimumDaysOfBackupsAllowed,
	getRewindDaysOfBackupsAllowed,
	getRewindDaysOfBackupsSaved,
	getBackupRetentionDays,
} from 'calypso/state/rewind/selectors';
import { setUsageLevel } from 'calypso/state/rewind/storage/action';
import { StorageUsageLevels } from 'calypso/state/rewind/storage/types';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { getUsageLevel } from './storage-usage-levels';
import UsageDisplay from './usage-display';
import Upsell from './usage-warning/upsell';

import './style.scss';

const BackupStorageSpace: React.FC = () => {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;
	useQueryRewindSize( siteId );
	useQueryRewindPolicies( siteId );
	useQuerySitePurchases( siteId );

	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const planRetentionDays =
		useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) ) || 0;
	const daysOfBackupsSaved =
		useSelector( ( state ) => getRewindDaysOfBackupsSaved( state, siteId ) ) || 0;
	const minDaysOfBackupsAllowed =
		useSelector( ( state ) => getRewindMinimumDaysOfBackupsAllowed( state, siteId ) ) || 0;
	const daysOfBackupsAllowed =
		useSelector( ( state ) => getRewindDaysOfBackupsAllowed( state, siteId ) ) || 0;
	const backupRetentionDays = useSelector( ( state ) => getBackupRetentionDays( state, siteId ) );
	const retentionDays = backupRetentionDays || planRetentionDays;
	const usageLevel =
		getUsageLevel(
			bytesUsed,
			bytesAvailable,
			minDaysOfBackupsAllowed,
			daysOfBackupsAllowed,
			retentionDays,
			daysOfBackupsSaved
		) ?? StorageUsageLevels.Normal;

	const showUpsell = usageLevel !== StorageUsageLevels.Normal;
	const requestingSize = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	// update the usage level
	React.useEffect( () => {
		dispatch( setUsageLevel( siteId, usageLevel ) );
	}, [ dispatch, siteId, usageLevel ] );

	// Sites without a storage policy don't have a notion of "bytes available,"
	// so this value will be undefined; if so, don't render
	if ( bytesAvailable === undefined ) {
		return null;
	}

	return (
		<Card className="backup-storage-space">
			<UsageDisplay loading={ requestingSize } usageLevel={ usageLevel } />
			{ showUpsell && (
				<Upsell
					siteSlug={ siteSlug }
					usageLevel={ usageLevel }
					bytesUsed={ bytesUsed as number }
					siteId={ siteId }
					daysOfBackupsSaved={ daysOfBackupsSaved }
					minDaysOfBackupsAllowed={ minDaysOfBackupsAllowed }
				/>
			) }
		</Card>
	);
};

export default BackupStorageSpace;
