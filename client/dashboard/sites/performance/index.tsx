import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import Report from './report';

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteSlug ) );

	if ( ! data ) {
		return null;
	}

	return (
		<PageLayout>
			<PageHeader title={ __( 'Performance' ) } />
			<Report site={ data.site } />
		</PageLayout>
	);
}

export default SitePerformance;
