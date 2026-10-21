import { useCallback } from 'react';
import useRecordResourceEventMutation from 'calypso/a8c-for-agencies/data/learn/use-record-resource-event-mutation';
import ResourceCenter from 'calypso/dashboard/agency/resources/learn/resource-center';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { APIAgencyResourcesResponse } from 'calypso/a8c-for-agencies/data/learn/types';
import type { ResourceItem } from 'calypso/dashboard/agency/resources/learn/types';

import './style.scss';

interface ResourceCenterOverviewContentProps {
	data: APIAgencyResourcesResponse | undefined;
}

export default function ResourceCenterOverviewContent( {
	data,
}: ResourceCenterOverviewContentProps ) {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const { mutate: recordResourceEvent } = useRecordResourceEventMutation();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	// Record the resource engagement server-side (a8c-specific).
	const handleResourceClick = useCallback(
		( resource: ResourceItem ) => {
			if ( agencyId ) {
				recordResourceEvent( {
					resourceId: resource.id,
					resourceName: resource.name,
					agencyId,
				} );
			}
		},
		[ agencyId, recordResourceEvent ]
	);

	return (
		<ResourceCenter
			data={ data }
			recordTracksEvent={ recordTracks }
			onResourceClick={ handleResourceClick }
		/>
	);
}
