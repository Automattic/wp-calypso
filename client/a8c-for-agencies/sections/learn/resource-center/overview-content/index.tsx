import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_VIEW } from 'calypso/dashboard/agency/resources/learn/dataviews/views';
import ResourceCenter, {
	getResourceCenterDescription,
} from 'calypso/dashboard/agency/resources/learn/resource-center';
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

	const resources = useMemo( () => data?.results ?? [], [ data ] );
	const [ view, setView ] = useState( DEFAULT_VIEW );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<>
			<Spacer marginBottom={ 8 }>
				<Text size={ 15 }>{ getResourceCenterDescription() }</Text>
			</Spacer>
			<ResourceCenter
				resources={ resources }
				view={ view }
				onChangeView={ setView }
				recordTracksEvent={ recordTracks }
				agencyId={ agencyId }
			/>
		</>
	);
}
