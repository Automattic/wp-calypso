import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

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
				used_storage: usedStorage,
				path: '/backup/:site',
			} )
		);
	}, [ dispatch, upsellOption, usedStorage ] );

	const onUpsellClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_click', {
				type: upsellOption,
				used_storage: usedStorage,
				path: '/backup/:site',
			} )
		);
	}, [ dispatch, upsellOption, usedStorage ] );

	const titleText =
		'out_of_storage' === upsellOption
			? translate( 'Your Backup storage is full and new backups have been paused' )
			: undefined;
	const statusText = preventWidows( getStatusText( upsellOption, storageLimit, translate ) );
	const actionText = preventWidows( translate( 'Upgrade your backup storage to 2TB' ) );

	return (
		<>
			{ titleText && <div className="backup-storage-space-upsell__title">{ titleText }</div> }
			<Button
				className="backup-storage-space-upsell__call-to-action"
				href={ href }
				onClick={ onUpsellClick }
			>
				<div className="backup-storage-space-upsell__copy">
					<div className="backup-storage-space-upsell__status">{ statusText }</div>
					<div className="backup-storage-space-upsell__action-text">{ actionText }</div>
				</div>
				<span className="backup-storage-space-upsell__arrow">&#8594;</span>
			</Button>
		</>
	);
};
