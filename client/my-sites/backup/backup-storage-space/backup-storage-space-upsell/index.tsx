/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export type BackupStorageSpaceUpsellOptions =
	| 'no_upsell'
	| 'first_upsell'
	| 'second_upsell'
	| 'out_of_storage';

const getStatusText = (
	upsellOption: BackupStorageSpaceUpsellOptions,
	storageLimit: number,
	translate: ReturnType< typeof useTranslate >
) => {
	switch ( upsellOption ) {
		case 'first_upsell':
			// TODO: calculate storage time, account for GB, and translate once API data is available.
			return sprintf( 'You will reach your %1$sGB storage limit in %2$s days', storageLimit, 3 );
		case 'second_upsell':
			return translate( 'You’re running out of storage space.' );
		case 'out_of_storage':
			return translate( 'You ran out of storage space.' );
		case 'no_upsell':
		default:
			return '';
	}
};

type Props = {
	href: string;
	storageLimit: number;
	upsellOption: BackupStorageSpaceUpsellOptions;
	usedStorage: number;
};

export const BackupStorageSpaceUpsell: FunctionComponent< Props > = ( {
	href,
	storageLimit,
	upsellOption,
	usedStorage,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_display', {
				type: upsellOption,
				usedStorage,
			} )
		);
	}, [ dispatch, upsellOption, usedStorage ] );

	const onUpsellClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_click', {
				type: upsellOption,
				usedStorage,
			} )
		);
	}, [ dispatch, upsellOption, usedStorage ] );

	const titleText =
		'out_of_storage' === upsellOption
			? translate( 'Your Backup storage is full and new backups have been paused' )
			: undefined;
	const statusText = getStatusText( upsellOption, storageLimit, translate );
	const actionText = translate( 'Upgrade your backup storage to 2TB' );

	return (
		<>
			{ titleText && <div className="backup-storage-space-upsell__title-text">{ titleText }</div> }
			<Button
				className="backup-storage-space-upsell__button"
				href={ href }
				onClick={ onUpsellClick }
			>
				<div className="backup-storage-space-upsell__grid">
					<div>
						<div className="backup-storage-space-upsell__status-text">{ statusText }</div>
						<div className="backup-storage-space-upsell__action-text">{ actionText }</div>
					</div>
					<Gridicon icon="arrow-right" />
				</div>
			</Button>
		</>
	);
};
