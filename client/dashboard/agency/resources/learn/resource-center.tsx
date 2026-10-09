import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import ResourceLibrary from './resource-library';
import { useReadResources } from './use-read-resources';
import type { RecordTracksEvent } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export const getResourceCenterDescription = () =>
	__( 'Resources to help you learn, win clients, and deliver great work.' );

interface ResourceCenterProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	recordTracksEvent?: RecordTracksEvent;
	onResourceClick?: ( resource: AgencyEnablementResource ) => void;
	/** The resource whose details are open. */
	selectedId: number | null;
	onSelectedIdChange: ( id: number | null ) => void;
}

export default function ResourceCenter( {
	resources: unsortedResources,
	view,
	onChangeView,
	recordTracksEvent = () => {},
	onResourceClick,
	selectedId,
	onSelectedIdChange,
}: ResourceCenterProps ) {
	const previewResource = useCallback(
		( resource: AgencyEnablementResource ) =>
			recordTracksEvent( 'calypso_a4a_resource_center_preview', {
				resource_id: resource.id,
				resource_name: resource.name,
			} ),
		[ recordTracksEvent ]
	);

	const openResource = useCallback(
		( resource: AgencyEnablementResource ) => {
			recordTracksEvent( 'calypso_a4a_resource_center_browse_cta_click', {
				resource_id: resource.id,
				resource_name: resource.name,
			} );

			// Host-specific side effect, such as recording the open server-side.
			onResourceClick?.( resource );
		},
		[ recordTracksEvent, onResourceClick ]
	);

	const { readIds, setRead } = useReadResources();

	const setResourceRead = ( resource: AgencyEnablementResource, isRead: boolean ) => {
		setRead( resource.id, isRead );
		recordTracksEvent( 'calypso_a4a_resource_center_read_status_change', {
			resource_id: resource.id,
			resource_name: resource.name,
			is_read: isRead,
		} );
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
			onChangeView={ onChangeView }
			onPreviewResource={ previewResource }
			onOpenResource={ openResource }
			readIds={ readIds }
			onSetRead={ setResourceRead }
			selectedId={ selectedId }
			onSelectedIdChange={ onSelectedIdChange }
		/>
	);
}
