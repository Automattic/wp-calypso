import {
	userPreferenceQuery,
	userPreferenceMutation,
	siteMediaStorageQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { sprintf, __ } from '@wordpress/i18n';
import filesize from 'filesize';
import { useState } from 'react';
import Notice from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getStorageAlertLevel } from '../../utils/site-storage';
import { AddStorageModal } from '../storage/add-storage-modal';
import type { Site } from '@automattic/api-core';

/**
 * Whether the storage warning banner is initially eligible to show: storage is
 * running low or exhausted, and a low-storage warning hasn't been dismissed.
 * In-session dismissal is handled inside the component itself.
 */
export function useShouldShowStorageWarningBanner( site: Site ) {
	const { data: mediaStorage } = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( `hosting-dashboard-overview-storage-notice-dismissed-${ site.ID }` )
	);

	const alertLevel = getStorageAlertLevel( mediaStorage );
	return alertLevel !== 'none' && ! ( alertLevel === 'warning' && isDismissedPersisted );
}

export function StorageWarningBanner( { site }: { site: Site } ) {
	const shouldShow = useShouldShowStorageWarningBanner( site );
	const { data: mediaStorage } = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );
	const { mutate: updateDismissed, isPending: isDismissing } = useMutation(
		userPreferenceMutation( `hosting-dashboard-overview-storage-notice-dismissed-${ site.ID }` )
	);
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const alertLevel = getStorageAlertLevel( mediaStorage );

	// Optimistically hide the banner while the dismissal preference is saving.
	if ( ! shouldShow || ( alertLevel === 'warning' && isDismissing ) ) {
		return null;
	}

	const noticeProps =
		alertLevel === 'warning'
			? {
					variant: 'warning' as const,
					isDismissible: true,
					title: __( 'Your site is low on storage' ),
					onClose: () => updateDismissed( new Date().toISOString() ),
			  }
			: {
					variant: 'error' as const,
					isDismissible: false,
					title: __( 'Your site is out of storage' ),
			  };

	const upsellId =
		alertLevel === 'warning'
			? 'site-overview-storage-warning-low'
			: 'site-overview-storage-warning-exceeded';

	return (
		<>
			<Notice
				{ ...noticeProps }
				actions={
					<UpsellCTAButton
						variant="primary"
						upsellId={ upsellId }
						upsellFeatureId="site-storage"
						onClick={ () => setIsModalOpen( true ) }
					>
						{ __( 'Add more storage' ) }
					</UpsellCTAButton>
				}
			>
				{ sprintf(
					// translators: %(used)s: amount of storage used, %(available)s: the storage limit, each including a unit, e.g. "2.03 MB" or "1.5 GB".
					__(
						'%(used)s of your %(available)s storage limit has been used. Upgrade to continue storing media, plugins, themes, and backups.'
					),
					{
						used: filesize( mediaStorage.storage_used_bytes, { round: 0 } ),
						available: filesize( mediaStorage.max_storage_bytes, { round: 0 } ),
					}
				) }
			</Notice>
			<AddStorageModal
				site={ site }
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
			/>
		</>
	);
}
