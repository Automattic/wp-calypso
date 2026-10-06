import {
	activeAgencyQuery,
	agencyEnablementResourcesQuery,
	agencyResourceEventMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { formatAgencyResources } from './format-resources';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';
import type { ResourceItem } from './types';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const resources = useMemo( () => formatAgencyResources( data.results ), [ data ] );
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
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ handleResourceClick }
			/>
		</PageLayout>
	);
}
