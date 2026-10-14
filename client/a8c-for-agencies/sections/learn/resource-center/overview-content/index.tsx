import { useCallback, useMemo } from 'react';
import { formatAgencyResources } from 'calypso/dashboard/agency/resources/learn/format-resources';
import ResourceCenter from 'calypso/dashboard/agency/resources/learn/resource-center';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { AgencyEnablementResourcesResponse } from '@automattic/api-core';

import './style.scss';

interface ResourceCenterOverviewContentProps {
	data: AgencyEnablementResourcesResponse | undefined;
}

export default function ResourceCenterOverviewContent( {
	data,
}: ResourceCenterOverviewContentProps ) {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );

	const resources = useMemo( () => formatAgencyResources( data?.results ?? [] ), [ data ] );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<ResourceCenter
			resources={ resources }
			recordTracksEvent={ recordTracks }
			agencyId={ agencyId }
		/>
	);
}
