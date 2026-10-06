import { agencyResourceEventMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { useCallback, useMemo, useState } from 'react';
import { formatAgencyResources } from 'calypso/dashboard/agency/resources/learn/format-resources';
import ResourceCenter, {
	getResourceCenterDescription,
} from 'calypso/dashboard/agency/resources/learn/resource-center';
import { DEFAULT_VIEW } from 'calypso/dashboard/agency/resources/learn/views';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { AgencyEnablementResourcesResponse } from '@automattic/api-core';
import type { ResourceItem } from 'calypso/dashboard/agency/resources/learn/types';

import './style.scss';

interface ResourceCenterOverviewContentProps {
	data: AgencyEnablementResourcesResponse | undefined;
}

export default function ResourceCenterOverviewContent( {
	data,
}: ResourceCenterOverviewContentProps ) {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const { mutate: recordResourceEvent } = useMutation( agencyResourceEventMutation() );

	const resources = useMemo( () => formatAgencyResources( data?.results ?? [] ), [ data ] );
	const [ view, setView ] = useState( DEFAULT_VIEW );

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
					resource_id: resource.id,
					resource_name: resource.name,
					agency_id: agencyId,
				} );
			}
		},
		[ agencyId, recordResourceEvent ]
	);

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>{ getResourceCenterDescription() }</Text>
			</Spacer>
			<ResourceCenter
				resources={ resources }
				view={ view }
				onChangeView={ setView }
				recordTracksEvent={ recordTracks }
				onResourceClick={ handleResourceClick }
			/>
		</>
	);
}
