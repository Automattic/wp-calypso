/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { Card, ProgressBar } from '@automattic/components';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getSiteBackupStorageAvailable,
	getSiteBackupStorageUsed,
} from 'calypso/state/rewind/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	BackupStorageSpaceUpsell,
	BackupStorageSpaceUpsellOptions,
} from './backup-storage-space-upsell';

/**
 * Style dependencies
 */
import './style.scss';

const upsellLimit1 = 0.6;
const upsellLimit2 = 0.85;

const progressBarWarnings: Record< BackupStorageSpaceUpsellOptions, string > = {
	no_upsell: 'no-warning',
	first_upsell: 'yellow-warning',
	second_upsell: 'red-warning',
	out_of_storage: 'red-warning',
};

export const BackupStorageSpace: React.FC = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug );

	const gigabytesAvailable = useSelector( ( state ) =>
		getSiteBackupStorageAvailable( state, siteId )
	);
	const gigabytesUsed = useSelector( ( state ) => getSiteBackupStorageUsed( state, siteId ) );

	if ( gigabytesAvailable === undefined || gigabytesUsed === undefined ) {
		return null;
	}

	const usedStorageFraction = gigabytesAvailable === 0 ? 0 : gigabytesUsed / gigabytesAvailable;

	let upsellOption: BackupStorageSpaceUpsellOptions = 'no_upsell';
	if ( usedStorageFraction >= upsellLimit1 ) {
		upsellOption = 'first_upsell';
	}
	if ( usedStorageFraction >= upsellLimit2 ) {
		upsellOption = 'second_upsell';
	}
	if ( gigabytesUsed >= gigabytesAvailable ) {
		upsellOption = 'out_of_storage';
	}

	const showUpsell = upsellOption !== 'no_upsell';

	const progressBarWarning = progressBarWarnings[ upsellOption ];

	// TODO: account for MB/GB and translate once API data is available
	const title = sprintf( '%1$sGB of %2$sGB used', gigabytesUsed, gigabytesAvailable );

	return (
		<Card className="backup-storage-space">
			<div className="backup-storage-space__progress-bar-container">
				<div className="backup-storage-space__progress-heading">
					{ translate( 'Storage space' ) }
				</div>
				<div className="backup-storage-space__progress-bar">
					<ProgressBar
						className={ progressBarWarning }
						value={ gigabytesUsed }
						total={ gigabytesAvailable }
					/>
				</div>
				<div className="backup-storage-space__progress-usage-text">{ title }</div>
			</div>
			{ showUpsell && (
				<>
					<div className="backup-storage-space__divider"></div>
					<BackupStorageSpaceUpsell
						upsellOption={ upsellOption }
						usedStorage={ gigabytesUsed }
						storageLimit={ gigabytesAvailable }
						href={ isJetpackCloud() ? `/pricing/backup/${ siteSlug }` : `/plans/${ siteSlug }` }
					/>
				</>
			) }
		</Card>
	);
};
