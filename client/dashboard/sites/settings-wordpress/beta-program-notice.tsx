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

interface BetaProgramNoticeProps {
	site: Site;
	wpVersion: string;
	actions?: React.ReactNode;
}

export function BetaProgramNotice( { site, wpVersion, actions }: BetaProgramNoticeProps ) {
	const backupUrl = getBackupUrl( site );
	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Notice
			variant="info"
			actions={ actions }
			title={ sprintf(
				/* translators: %s is the WordPress version string e.g. "6.8 beta" */
				__( 'Your site is running WordPress %s' ),
				wpVersion
			) }
		>
			{ site.is_wpcom_staging_site ||
			! hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE )
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
							'If you notice anything unexpected, <support>let us know</support>. Your feedback helps shape WordPress. You can switch back to the stable release or <backup>restore your backup</backup> anytime.'
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
