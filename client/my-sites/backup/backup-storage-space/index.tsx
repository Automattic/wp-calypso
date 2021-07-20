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

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	storageLimit: number;
	usedStorage: number;
};

export const BackupStorageSpace: FunctionComponent< Props > = ( { storageLimit, usedStorage } ) => {
	const translate = useTranslate();

	const usedStorageFraction = usedStorage / storageLimit;
	let color = '#2C3338';
	if ( 0.6 <= usedStorageFraction ) {
		color = '#DEB100';
	}
	if ( 0.85 <= usedStorageFraction ) {
		color = '#E65054';
	}

	// TODO: account for MB/GB and translate once API data is available
	const title = sprintf( '%1$sGB of %2$sGB used', usedStorage, storageLimit );

	return (
		<Card className="backup-storage-space">
			<div className="backup-storage-space__container">
				<div>{ translate( 'Storage space' ) }</div>
				<div className="backup-storage-space__progress-bar">
					<ProgressBar
						value={ usedStorage }
						total={ storageLimit }
						color={ color }
						title={ title }
					/>
				</div>
				<div>{ title }</div>
			</div>
		</Card>
	);
};
