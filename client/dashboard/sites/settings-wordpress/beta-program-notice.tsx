import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../app/help-center';
import { Notice } from '../../components/notice';
import { getBackupUrl } from '../../utils/site-backup';
import type { Site } from '@automattic/api-core';

interface BetaProgramNoticeProps {
	site: Site;
	wpVersion: string;
}

export function BetaProgramNotice( { site, wpVersion }: BetaProgramNoticeProps ) {
	const backupUrl = getBackupUrl( site );
	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Notice
			variant="info"
			title={ sprintf(
				/* translators: %s is the WordPress version string e.g. "6.8 beta" */
				__( 'Your site is running WordPress %s' ),
				wpVersion
			) }
		>
			{ site.is_wpcom_staging_site
				? createInterpolateElement(
						__(
							'If you notice anything unexpected, <support>let us know</support>. Your feedback helps shape WordPress. You can switch back to the stable release anytime.'
						),
						{
							support: <Button variant="link" onClick={ () => setShowHelpCenter( true ) } />,
						}
				  )
				: createInterpolateElement(
						__(
							'If you notice anything unexpected, <support>let us know</support>. Your feedback helps shape WordPress. You can switch back to the stable release anytime. A <backup>backup of your site</backup> is available if you ever need it.'
						),
						{
							support: <Button variant="link" onClick={ () => setShowHelpCenter( true ) } />,
							backup: <a href={ backupUrl } />,
						}
				  ) }
		</Notice>
	);
}
