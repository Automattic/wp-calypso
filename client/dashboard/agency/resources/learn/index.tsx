import {
	activeAgencyQuery,
	agencyEnablementResourcesQuery,
	agencyResourceEventMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { learnRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW } from './dataviews/views';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';
import type { AgencyEnablementResource } from '@automattic/api-core';

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
	const { mutate: recordResourceEvent } = useMutation( agencyResourceEventMutation() );
	const agencyId = agency?.id;

	const handleResourceClick = useCallback(
		( resource: AgencyEnablementResource ) => {
			if ( agencyId ) {
				recordResourceEvent( {
					resource_id: resource.id,
					resource_name: resource.name,
					agency_id: agencyId,
				} );
			}
		},
		[ agencyId, recordResourceEvent ]
	);

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
				onResourceClick={ handleResourceClick }
			/>
		</PageLayout>
	);
}
