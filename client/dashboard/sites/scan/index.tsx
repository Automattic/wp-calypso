import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { useSiteTimezone } from '../../app/hooks/use-site-timezone';
import { siteRoute } from '../../app/router/sites';
import TimeMismatchNotice, {
	useShouldShowTimeMismatchNotice,
} from '../../components/time-mismatch-notice';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SitesNoticeArbiter } from '../notice-arbiter';
import illustrationUrl from './scan-callout-illustration.svg';
import { ScanContent } from './scan-content';

function SiteScan( { scanTab }: { scanTab: 'active' | 'history' } ) {
	const { siteSlug } = siteRoute.useParams();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const settingsUrl = site.options?.admin_url
		? `${ site.options.admin_url }options-general.php`
		: '';

	const { gmtOffset, timezoneString } = useSiteTimezone( site.ID );

	const showTimeMismatchNotice = useShouldShowTimeMismatchNotice( {
		siteTime: gmtOffset,
		siteId: site.ID,
	} );

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.SCAN_SELF_SERVE }
			fullPage
			title={ __( 'Scan' ) }
			upsellId="site-scan"
			upsellIcon={ shield }
			upsellTitle={ __( 'Scan for security threats' ) }
			upsellImage={ illustrationUrl }
			upsellDescription={ __(
				'Automated daily scans check for malware and security vulnerabilities, with automated fixes for most issues.'
			) }
		>
			<ScanContent
				site={ site }
				scanTab={ scanTab }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
				notices={
					<SitesNoticeArbiter>
						{ showTimeMismatchNotice && (
							<TimeMismatchNotice
								settingsUrl={ settingsUrl }
								siteTime={ gmtOffset }
								siteId={ site.ID }
							/>
						) }
					</SitesNoticeArbiter>
				}
			/>
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteScan;
