import { SiteMediaStorage, AddOns, StorageAddOnSlug } from '@automattic/data-stores';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import React from 'react';
import { getIntlLocale } from 'calypso/dashboard/utils/locale';
import { formatStorage } from 'calypso/dashboard/utils/site-storage';

import './style.scss';

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
	const translate = useTranslate();
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

	const locale = getIntlLocale( getLocaleSlug() );
	const newMaxStorage = formatStorage( newMaxStorageBytes, locale );
	const usedStorage = formatStorage( storageUsedBytes, locale );
	const planStorage = formatStorage( planStorageBytes, locale );
	const addOnStorage = formatStorage( addOnStorageBytes, locale );

	const planStorageRatio = planStorageBytes / newMaxStorageBytes;

	return (
		<div className="storage-indicator">
			<div className="storage-indicator__usage">
				<span className="storage-indicator__usage--capacity">{ newMaxStorage }</span>
				<span className="storage-indicator__usage--used">
					{ translate( '%(usedStorage)s used', { args: { usedStorage } } ) }
				</span>
			</div>
			<div className="storage-indicator__bar">
				<div
					className="storage-indicator__bar--existing"
					style={ { width: `${ planStorageRatio * 100 }%` } }
				/>
				<div
					className="storage-indicator__bar--add-on"
					style={ { width: `${ ( 1 - planStorageRatio ) * 100 }%` } }
				/>
			</div>
			<div className="storage-indicator__quota">
				<div className="storage-indicator__quota--plan">
					{ translate( '%(planStorage)s plan storage', { args: { planStorage } } ) }
				</div>
				<div className="storage-indicator__quota--add-on">
					{ translate( '%(addOnStorage)s storage add-on', { args: { addOnStorage } } ) }
				</div>
			</div>
		</div>
	);
};

export default StorageAddOnIndicator;
