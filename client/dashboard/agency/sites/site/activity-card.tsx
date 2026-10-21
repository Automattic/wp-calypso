import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { agencySiteRoute } from '../../../app/router/agency';
import LatestActivityCard from '../../../sites/overview-latest-activity-card';

export default function ActivityCard() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return null;
	}

	return (
		<LatestActivityCard site={ site } activityLogUrl={ `/sites/${ siteSlug }/logs/activity` } />
	);
}
