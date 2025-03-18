import { SiteMediaStorage, AddOns, StorageAddOnSlug } from '@automattic/data-stores';
import filesize from 'filesize';
import React from 'react';

type Props = {
	mediaStorage: SiteMediaStorage;
	selectedStorageAddOnSlug: StorageAddOnSlug | null;
	siteId: number;
};

const StorageAddOnIndicator: React.FC< Props > = ( {
	siteId,
	mediaStorage,
	selectedStorageAddOnSlug,
} ) => {
	const { maxStorageBytes, storageUsedBytes, maxStorageBytesFromAddOns } = mediaStorage;
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageAddOn = storageAddOns?.find(
		( addOn ) => addOn?.addOnSlug === selectedStorageAddOnSlug
	);

	const BYTES_PER_GB = Math.pow( 1024, 3 );
	const selectedAddOnStorageBytes = ( selectedStorageAddOn?.quantity ?? 0 ) * BYTES_PER_GB;
	const newMaxStorageBytes = maxStorageBytes + selectedAddOnStorageBytes;
	const planStorageBytes = maxStorageBytes - maxStorageBytesFromAddOns;
	const addOnStorageBytes = maxStorageBytesFromAddOns + selectedAddOnStorageBytes;

	const newMaxStorage = filesize( newMaxStorageBytes, { round: 0 } );
	const usedStorage = filesize( storageUsedBytes, { round: 0 } );
	const planStorage = filesize( planStorageBytes, { round: 0 } );
	const addOnStorage = filesize( addOnStorageBytes, { round: 0 } );

	const planStorageRatio = planStorageBytes / newMaxStorageBytes;

	return (
		<div className="storage-indicator">
			<div>
				<div>{ newMaxStorage }</div>
				<div>{ usedStorage } used</div>
			</div>
			<div className="storage-indicator__bar">
				<div
					className="storage-indicator__bar-existing"
					style={ { width: `${ planStorageRatio * 100 }%` } }
				/>
				<div
					className="storage-indicator__bar-add-on"
					style={ { width: `${ ( 1 - planStorageRatio ) * 100 }%` } }
				/>
			</div>
			<div>
				<div>{ planStorage } plan storage</div>
				<div>{ addOnStorage } add-on storage</div>
			</div>
		</div>
	);
};

export default StorageAddOnIndicator;
