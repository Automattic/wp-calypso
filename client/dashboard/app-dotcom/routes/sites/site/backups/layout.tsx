import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { siteRoute } from '../../../../../app/router/sites';
import { ThemedIllustration } from '../../../../../components/themed-illustration';
import { BackupFileBrowserProvider } from '../../../../../sites/backups/components/backup-file-browser-provider';
import illustrationDarkUrl from '../../../../../sites/backups/components/upsell-illustration/upsell-illustration-dark.svg';
import illustrationUrl from '../../../../../sites/backups/components/upsell-illustration/upsell-illustration.svg';
import HostingFeatureGatedWithCallout from '../../../../../sites/hosting-features/components/hosting-feature-gated-with-callout';
import '../../../../../sites/backups/style.scss';

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.BACKUPS_SELF_SERVE }
			fullPage
			upsellId="site-backups"
			upsellIcon={ backup }
			upsellTitle={ __( 'Secure your content with Jetpack Backups' ) }
			upsellImage={ <ThemedIllustration light={ illustrationUrl } dark={ illustrationDarkUrl } /> }
			upsellDescription={ __(
				'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
			) }
		>
			<BackupFileBrowserProvider>
				<Outlet />
			</BackupFileBrowserProvider>
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteBackups;
