import { Card } from '@automattic/components';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import {
	getRewindBytesAvailable,
	getRewindBytesUsed,
	isRequestingRewindPolicies,
	isRequestingRewindSize,
} from 'calypso/state/rewind/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getUsageLevel, StorageUsageLevels } from './storage-usage-levels';
import UsageDisplay from './usage-display';
import UsageWarning from './usage-warning';

import './style.scss';

const BackupStorageSpace: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	useQueryRewindSize( siteId );
	useQueryRewindPolicies( siteId );

	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const usageLevel = getUsageLevel( bytesUsed, bytesAvailable ) ?? StorageUsageLevels.Normal;

	const showWarning = usageLevel > StorageUsageLevels.Normal;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;

	const requestingPolicies = useSelector( ( state ) =>
		isRequestingRewindPolicies( state, siteId )
	);
	const requestingSize = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );

	if ( requestingPolicies ) {
		return <Card className="backup-storage-space__loading" />;
	}

	// Sites without a storage policy don't have a notion of "bytes available,"
	// so this value will be undefined; if so, don't render
	if ( bytesAvailable === undefined ) {
		return null;
	}

	return (
		<Card className="backup-storage-space">
			<UsageDisplay loading={ requestingSize } usageLevel={ usageLevel } />
			{ showWarning && (
				<>
					<div className="backup-storage-space__divider"></div>
					<UsageWarning
						siteSlug={ siteSlug }
						usageLevel={ usageLevel }
						bytesUsed={ bytesUsed as number }
					/>
				</>
			) }
		</Card>
	);
};

export default BackupStorageSpace;
