import { agencySiteQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { agencySiteRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { getDisplayUrl, getSiteName } from '../dataviews/site-data';

export default function AgencySiteOverview() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );

	if ( ! site ) {
		return null;
	}

	return (
		<PageLayout
			header={ <PageHeader title={ getSiteName( site ) } description={ getDisplayUrl( site ) } /> }
		/>
	);
}
