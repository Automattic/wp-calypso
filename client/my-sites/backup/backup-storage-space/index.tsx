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

const progressBarColors: Record< BackupStorageSpaceUpsellOptions, string > = {
	no_upsell: '#2C3338',
	first_upsell: '#DEB100',
	second_upsell: '#E65054',
	out_of_storage: '#E65054',
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

	const progressBarColor = progressBarColors[ upsellOption ];

	// TODO: account for MB/GB and translate once API data is available
	const title = sprintf( '%1$sGB of %2$sGB used', usedStorage, storageLimit );

	return (
		<Card className="backup-storage-space">
			<div className="backup-storage-space__progress-bar-container">
				<div>{ translate( 'Storage space' ) }</div>
				<div className="backup-storage-space__progress-bar">
					<ProgressBar
						value={ usedStorage }
						total={ storageLimit }
						color={ progressBarColor }
						title={ title }
					/>
				</div>
				<div>{ title }</div>
			</div>
			{ showUpsell && (
				<>
					<div className="backup-storage-space__divider"></div>
					<BackupStorageSpaceUpsell
						upsellOption={ upsellOption }
						storageLimit={ storageLimit }
						href="/pricing/backup"
					/>
				</>
			) }
		</Card>
	);
};
