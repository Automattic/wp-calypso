import {
	BACKUP_PLUGINS_PATH,
	WOOCOMMERCE_SUBSCRIPTIONS_PLUGIN_SLUG,
	selectBackupIncludesPlugin,
	siteBackupContentsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';

const SUPPORT_URL = 'https://jetpack.com/support/getting-started-with-jetpack/known-issues/#backup';

/**
 * Warns that restoring the database can re-run subscription renewals that were
 * already charged after the restore point. See BACKUP-438.
 *
 * `includesDatabase` gates the notice: the duplicate-charge risk comes from
 * reverting Action Scheduler tables and subscription postmeta, so a files-only
 * restore is not affected.
 */
export default function WooSubscriptionsNotice( {
	siteId,
	rewindId,
	includesDatabase,
}: {
	siteId: number;
	rewindId: string;
	includesDatabase: boolean;
} ) {
	const { data: hasWooSubscriptions } = useQuery( {
		...siteBackupContentsQuery( siteId, Number( rewindId ), BACKUP_PLUGINS_PATH ),
		select: selectBackupIncludesPlugin( WOOCOMMERCE_SUBSCRIPTIONS_PLUGIN_SLUG ),
		enabled: !! siteId && !! rewindId && includesDatabase,
	} );

	if ( ! includesDatabase || ! hasWooSubscriptions ) {
		return null;
	}

	return (
		<Notice variant="warning" title={ __( 'This restore may charge your customers twice' ) }>
			{ createInterpolateElement(
				__(
					'This backup includes WooCommerce Subscriptions. Renewals that were charged after the selected restore point will look unpaid again once the database is restored, and may be processed a second time. <link>Learn more</link>'
				),
				{
					// @ts-expect-error children prop is injected by createInterpolateElement
					link: <ExternalLink href={ SUPPORT_URL } />,
				}
			) }
		</Notice>
	);
}
