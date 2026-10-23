import { agencyResourceEventMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import ResourceLibrary from './resource-library';
import type { RecordTracksEvent } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

/** A view's filters, flattened for Tracks, such as "stage:sell,product:jetpack|pressable". */
function describeFilters( filters: View[ 'filters' ] = [] ) {
	return filters
		.map( ( { field, value } ) => `${ field }:${ [ value ].flat().join( '|' ) }` )
		.join( ',' );
}

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

	const changeView = ( nextView: View ) => {
		const filters = describeFilters( nextView.filters );
		// Search changes the view on every keystroke, so only layout and filter changes are recorded.
		if ( nextView.type !== view.type || filters !== describeFilters( view.filters ) ) {
			recordTracksEvent( 'calypso_a4a_resource_center_view_change', {
				layout: nextView.type,
				filters,
			} );
		}
		onChangeView( nextView );
	};

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
			onChangeView={ changeView }
			onOpenResource={ openResource }
			onLoadMore={ () => recordTracksEvent( 'calypso_a4a_resource_center_load_more' ) }
		/>
	);
}
