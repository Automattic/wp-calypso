import { Card } from '@automattic/components';
import React from 'react';
import { useSelector } from 'react-redux';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getRewindBytesAvailable,
	getRewindBytesUsed,
	isRequestingRewindPolicies,
	isRequestingRewindSize,
} from 'calypso/state/rewind/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { BackupStorageSpaceUpsell } from './backup-storage-space-upsell';
import { getUsageLevel, StorageUsageLevels } from './storage-usage-levels';
import UsageDisplay from './usage-display';

import './style.scss';

const BackupStorageSpace: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	useQueryRewindSize( siteId );
	useQueryRewindPolicies( siteId );

	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const usageLevel = getUsageLevel( bytesUsed, bytesAvailable ) ?? StorageUsageLevels.Normal;

	const showUpsell = usageLevel > StorageUsageLevels.Normal;
	const siteSlug = useSelector( getSelectedSiteSlug );

	const requesting = useSelector(
		( state ) =>
			isRequestingRewindSize( state, siteId ) || isRequestingRewindPolicies( state, siteId )
	);
	if ( requesting ) {
		return null;
	}

	// Don't render this component if we don't have data
	// on how much storage space is available to be used
	if ( bytesAvailable === undefined ) {
		return null;
	}

	return (
		<Card className="backup-storage-space">
			<UsageDisplay usageLevel={ usageLevel } />
			{ showUpsell && (
				<>
					<div className="backup-storage-space__divider"></div>
					<BackupStorageSpaceUpsell
						usageLevel={ usageLevel }
						bytesUsed={ bytesUsed as number }
						href={ isJetpackCloud() ? `/pricing/backup/${ siteSlug }` : `/plans/${ siteSlug }` }
					/>
				</>
			) }
		</Card>
	);
};

export default BackupStorageSpace;
