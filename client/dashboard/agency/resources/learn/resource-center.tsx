import { agencyResourceEventMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import ResourceLibrary from './resource-library';
import type { RecordTracksEvent } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export const getResourceCenterDescription = () =>
	__( 'Resources to help you learn, win clients, and deliver great work.' );

interface ResourceCenterProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	recordTracksEvent: RecordTracksEvent;
	/** The agency opened resources are recorded against, once it has loaded. */
	agencyId: number | undefined;
}

export default function ResourceCenter( {
	resources: unsortedResources,
	view,
	onChangeView,
	recordTracksEvent,
	agencyId,
}: ResourceCenterProps ) {
	const { mutate: recordResourceEvent } = useMutation(
		agencyResourceEventMutation( agencyId ?? 0 )
	);

	const openResource = useCallback(
		( resource: AgencyEnablementResource ) => {
			recordTracksEvent( 'calypso_a4a_resource_center_browse_cta_click', {
				resource_id: resource.id,
				resource_name: resource.name,
			} );

			if ( agencyId ) {
				recordResourceEvent( { resource_id: resource.id, resource_name: resource.name } );
			}
		},
		[ recordTracksEvent, agencyId, recordResourceEvent ]
	);

	const resources = useMemo(
		() =>
			// Featured first, then by created_at descending (newest first).
			[ ...unsortedResources ].sort(
				( a, b ) =>
					Number( b.is_featured ) - Number( a.is_featured ) ||
					new Date( b.created_at ).getTime() - new Date( a.created_at ).getTime()
			),
		[ unsortedResources ]
	);

	return (
		<ResourceLibrary
			resources={ resources }
			view={ view }
			onChangeView={ onChangeView }
			onOpenResource={ openResource }
		/>
	);
}
