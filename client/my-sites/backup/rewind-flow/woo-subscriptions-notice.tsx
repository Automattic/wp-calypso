import {
	BACKUP_PLUGINS_PATH,
	WOOCOMMERCE_SUBSCRIPTIONS_PLUGIN_SLUG,
	selectBackupIncludesPlugin,
	siteBackupContentsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import type { FunctionComponent } from 'react';

const SUPPORT_URL = 'https://jetpack.com/support/getting-started-with-jetpack/known-issues/#backup';

interface Props {
	siteId: number;
	rewindId: string;
	/**
	 * Whether the pending restore includes the database. The duplicate-charge
	 * risk comes from reverting Action Scheduler tables and subscription
	 * postmeta, so a files-only restore is not affected.
	 */
	includesDatabase: boolean;
}

/**
 * Warns that restoring the database can re-run subscription renewals that were
 * already charged after the restore point. See BACKUP-438.
 */
const WooSubscriptionsNotice: FunctionComponent< Props > = ( {
	siteId,
	rewindId,
	includesDatabase,
} ) => {
	const translate = useTranslate();

	const { data: hasWooSubscriptions } = useQuery( {
		...siteBackupContentsQuery( siteId, Number( rewindId ), BACKUP_PLUGINS_PATH ),
		select: selectBackupIncludesPlugin( WOOCOMMERCE_SUBSCRIPTIONS_PLUGIN_SLUG ),
		enabled: !! siteId && !! rewindId && includesDatabase,
	} );

	if ( ! includesDatabase || ! hasWooSubscriptions ) {
		return null;
	}

	return (
		<RewindFlowNotice
			gridicon="notice"
			title={ translate( 'This restore may charge your customers twice.' ) }
			message={ translate(
				'This backup includes WooCommerce Subscriptions. Renewals that were charged after the selected restore point will look unpaid again once the database is restored, and may be processed a second time. {{a}}Learn more{{/a}}',
				{
					components: {
						a: <a href={ SUPPORT_URL } target="_blank" rel="noopener noreferrer" />,
					},
				}
			) }
			type={ RewindFlowNoticeLevel.WARNING }
		/>
	);
};

export default WooSubscriptionsNotice;
