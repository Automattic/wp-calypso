import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_VIEW } from 'calypso/dashboard/agency/resources/learn/dataviews/views';
import ResourceCenter, {
	getResourceCenterDescription,
} from 'calypso/dashboard/agency/resources/learn/resource-center';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useReadResources } from './use-read-resources';
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
	const { readIds, setReadIds } = useReadResources();

	const resources = useMemo( () => data?.results ?? [], [ data ] );
	const [ view, setView ] = useState( DEFAULT_VIEW );
	// Opens the resource a copied link names.
	const [ selectedId, setSelectedId ] = useState< number | null >( () => {
		const id = Number( getQueryArg( window.location.href, 'resource' ) );
		return Number.isInteger( id ) && id > 0 ? id : null;
	} );
	const selectResource = useCallback( ( id: number | null ) => {
		setSelectedId( id );
		// Drop the linked resource from the address once closed, so a reload doesn't reopen it.
		if ( id === null ) {
			window.history.replaceState(
				window.history.state,
				'',
				removeQueryArgs( window.location.href, 'resource' )
			);
		}
	}, [] );

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
				readIds={ readIds }
				onReadIdsChange={ setReadIds }
				selectedId={ selectedId }
				onSelectedIdChange={ selectResource }
			/>
		</>
	);
}
