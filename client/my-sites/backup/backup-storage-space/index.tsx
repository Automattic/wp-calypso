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
import { BackupStorageSpaceUpsell } from './backup-storage-space-upsell';

/**
 * Style dependencies
 */
import './style.scss';

type Props = Record< string, never >;

const upsellLimit1 = 0.6;
const upsellLimit2 = 0.85;

export const BackupStorageSpace: FunctionComponent< Props > = () => {
	const storageLimit = 200;
	const usedStorage = 200;

	const translate = useTranslate();

	const usedStorageFraction = usedStorage / storageLimit;

	const showUpsell = upsellLimit1 <= usedStorageFraction;

	let progressBarColor = '#2C3338';
	if ( usedStorageFraction >= upsellLimit1 ) {
		progressBarColor = '#DEB100';
	}
	if ( usedStorageFraction >= upsellLimit2 ) {
		progressBarColor = '#E65054';
	}

	const actionText = translate( 'Upgrade your backup storage to 2TB' );

	let statusText;
	let titleText;
	if ( usedStorageFraction >= upsellLimit1 ) {
		// TODO: calculate storage time, account for GB, and translate once API data is available.
		statusText = sprintf(
			'You will reach your %1$sGB storage limit in %2$s days',
			storageLimit,
			3
		);
	}
	if ( usedStorageFraction >= upsellLimit2 ) {
		statusText = translate( 'You’re running out of storage space.' );
	}
	if ( 1 === usedStorageFraction ) {
		statusText = translate( 'You ran out of storage space.' );
		titleText = translate( 'Your Backup storage is full and new backups have been paused' );
	}

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
						titleText={ titleText }
						statusText={ statusText }
						actionText={ actionText }
						href="/pricing/backup"
					/>
				</>
			) }
		</Card>
	);
};
