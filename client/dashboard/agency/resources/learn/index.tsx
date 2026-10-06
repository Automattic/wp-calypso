import {
	activeAgencyQuery,
	agencyEnablementResourcesQuery,
	agencyResourceEventMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { learnRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { formatAgencyResources } from './format-resources';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';
import { DEFAULT_VIEW } from './views';
import type { ResourceItem } from './types';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const resources = useMemo( () => formatAgencyResources( data.results ), [ data ] );
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
		( resource: ResourceItem ) => {
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
				resources={ resources }
				view={ view }
				onChangeView={ updateView }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ handleResourceClick }
			/>
		</PageLayout>
	);
}
