import { HostingFeatures } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../app/help-center';
import { Notice } from '../../components/notice';
import { getBackupUrl } from '../../utils/site-backup';
import { hasHostingFeature } from '../../utils/site-features';
import { isRelativeUrl } from '../../utils/url';
import type { Site } from '@automattic/api-core';

interface EarlyAccessNoticeProps {
	site: Site;
	wpVersion: string;
}

export function EarlyAccessNotice( { site, wpVersion }: EarlyAccessNoticeProps ) {
	const backupUrl = getBackupUrl( site );
	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Notice
			variant="info"
			title={ sprintf(
				/* translators: %s is the WordPress release, e.g. "7.2" */
				__( 'Your site got early access to WordPress %s' ),
				wpVersion
			) }
		>
			{ site.is_wpcom_staging_site ||
			! hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE )
				? createInterpolateElement(
						sprintf(
							/* translators: %s is the WordPress release, e.g. "7.2" */
							__(
								'We’ve given your site early access to WordPress %s, ahead of the final release. Your feedback helps shape WordPress, so <support>let us know</support> if you notice anything unexpected. You can switch back to the stable release anytime.'
							),
							wpVersion
						),
						{
							support: <Button variant="link" onClick={ () => setShowHelpCenter( true ) } />,
						}
					)
				: createInterpolateElement(
						sprintf(
							/* translators: %s is the WordPress release, e.g. "7.2" */
							__(
								'We’ve given your site early access to WordPress %s, ahead of the final release. Your feedback helps shape WordPress, so <support>let us know</support> if you notice anything unexpected. You can switch back to the stable release or <backup>restore your backup</backup> anytime.'
							),
							wpVersion
						),
						{
							support: <Button variant="link" onClick={ () => setShowHelpCenter( true ) } />,
							backup: isRelativeUrl( backupUrl ) ? (
								<Link to={ backupUrl } />
							) : (
								<a href={ backupUrl } />
							),
						}
					) }
		</Notice>
	);
}
