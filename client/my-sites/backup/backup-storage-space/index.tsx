/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { Card, ProgressBar } from '@automattic/components';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
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

type Props = Record< string, never >;

export const BackupStorageSpace: FunctionComponent< Props > = () => {
	const storageLimit = 200;
	const usedStorage = 200;

	const translate = useTranslate();

	const usedStorageFraction = usedStorage / storageLimit;

	let upsellOption: BackupStorageSpaceUpsellOptions = 'no_upsell';
	if ( usedStorageFraction >= upsellLimit1 ) {
		upsellOption = 'first_upsell';
	}
	if ( usedStorageFraction >= upsellLimit2 ) {
		upsellOption = 'second_upsell';
	}
	if ( usedStorage >= storageLimit ) {
		upsellOption = 'out_of_storage';
	}

	const showUpsell = upsellOption !== 'no_upsell';

	const progressBarWarning = progressBarWarnings[ upsellOption ];

	// TODO: account for MB/GB and translate once API data is available
	const title = sprintf( '%1$sGB of %2$sGB used', usedStorage, storageLimit );

	return (
		<Card className="backup-storage-space">
			<div className="backup-storage-space__progress-bar-container">
				<div className="backup-storage-space__progress-heading">
					{ translate( 'Storage space' ) }
				</div>
				<div className="backup-storage-space__progress-bar">
					<ProgressBar
						className={ progressBarWarning }
						value={ usedStorage }
						total={ storageLimit }
					/>
				</div>
				<div className="backup-storage-space__progress-usage-text">{ title }</div>
			</div>
			{ showUpsell && (
				<>
					<div className="backup-storage-space__divider"></div>
					<BackupStorageSpaceUpsell
						upsellOption={ upsellOption }
						storageLimit={ storageLimit }
						usedStorage={ usedStorage }
						href="/pricing/backup"
					/>
				</>
			) }
		</Card>
	);
};
