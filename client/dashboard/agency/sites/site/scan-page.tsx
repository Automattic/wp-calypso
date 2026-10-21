import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSiteTimezone } from '../../../app/hooks/use-site-timezone';
import { agencySiteRoute } from '../../../app/router/agency';
import { ScanContent } from '../../../sites/scan/scan-content';

export default function AgencySiteScanPage( { scanTab }: { scanTab: 'active' | 'history' } ) {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { gmtOffset, timezoneString } = useSiteTimezone( site.ID );

	return (
		<ScanContent
			site={ site }
			scanTab={ scanTab }
			timezoneString={ timezoneString }
			gmtOffset={ gmtOffset }
		/>
	);
}
