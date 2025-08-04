import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { sprintf, __ } from '@wordpress/i18n';
import { userPreferenceQuery, userPreferenceMutation } from '../../app/queries/me-preferences';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import Notice from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import type { Site } from '../../data/types';

export function StorageWarningBanner( { site }: { site: Site } ) {
	const {
		data: {
			extra: { alertLevel, storageUsedDisplay, maxStorageDisplay },
		},
	} = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( `hosting-dashboard-overview-storage-notice-dismissed-${ site.ID }` )
	);
	const { mutate: updateDismissed, isPending: isDismissing } = useMutation(
		userPreferenceMutation( `hosting-dashboard-overview-storage-notice-dismissed-${ site.ID }` )
	);

	// Optimistically hide the banner assuming the preference will get saved.
	const isDismissed = isDismissedPersisted || isDismissing;

	if ( alertLevel === 'none' || ( alertLevel === 'low' && isDismissed ) ) {
		return null;
	}

	const noticeProps =
		alertLevel === 'low'
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

	const tracksId = alertLevel === 'low' ? 'storage-warning-low' : 'storage-warning-exceeded';

	return (
		<Notice
			{ ...noticeProps }
			actions={
				<UpsellCTAButton variant="primary" tracksId={ tracksId } href={ `/add-ons/${ site.slug }` }>
					{ __( 'Add more storage' ) }
				</UpsellCTAButton>
			}
		>
			{ sprintf(
				// translators: "used" and "available" amounts data including a unit, e.g. "2.03 MB" or "1.5 GB".
				__(
					'%(used)s of your %(available)s storage limit has been used. Upgrade to continue storing media, plugins, themes, and backups.'
				),
				{
					used: storageUsedDisplay,
					available: maxStorageDisplay,
				}
			) }
		</Notice>
	);
}
