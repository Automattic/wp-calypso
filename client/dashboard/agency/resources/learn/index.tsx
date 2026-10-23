import { activeAgencyQuery, agencyEnablementResourcesQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { learnRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW } from './dataviews/views';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const searchParams = learnRoute.useSearch();
	const { view, updateView } = usePersistentView( {
		slug: 'agency-library',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
	} );
	const { data: agency } = useQuery( activeAgencyQuery() );

	return (
		<PageLayout
			header={
				<PageHeader title={ __( 'Library' ) } description={ getResourceCenterDescription() } />
			}
		>
			<ResourceCenter
				resources={ data.results }
				view={ view }
				onChangeView={ updateView }
				recordTracksEvent={ recordTracksEvent }
				agencyId={ agency?.id }
			/>
		</PageLayout>
	);
}
