import { Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import BrowseAllResources from './browse-all-resources';
import { getYouTubeEmbedUrl } from './youtube-embed';
import type { OpenResource, RecordTracksEvent } from './types';
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
}

export default function ResourceCenter( {
	resources: unsortedResources,
	view,
	onChangeView,
	recordTracksEvent = () => {},
	onResourceClick,
}: ResourceCenterProps ) {
	const [ videoResource, setVideoResource ] = useState< AgencyEnablementResource | null >( null );

	const openResource: OpenResource = useCallback(
		( resource, event ) => {
			if ( resource.format === 'video' ) {
				event.preventDefault();
				setVideoResource( resource );
			}

			recordTracksEvent( 'calypso_a4a_resource_center_browse_cta_click', {
				resource_id: resource.id,
				resource_name: resource.name,
			} );

			// Host-specific side effect, such as recording the open server-side.
			onResourceClick?.( resource );
		},
		[ recordTracksEvent, onResourceClick ]
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
		<>
			<BrowseAllResources
				resources={ resources }
				view={ view }
				onChangeView={ onChangeView }
				onOpenResource={ openResource }
			/>

			{ videoResource && (
				<Modal
					isDismissible
					size="large"
					onRequestClose={ () => setVideoResource( null ) }
					title={ videoResource.name }
				>
					<VStack spacing={ 4 }>
						<div
							style={ {
								position: 'relative',
								paddingBottom: '56.25%',
								height: 0,
								overflow: 'hidden',
							} }
						>
							<iframe
								src={ getYouTubeEmbedUrl( videoResource.external_url ) }
								title={ videoResource.name }
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								style={ {
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
								} }
							/>
						</div>
					</VStack>
				</Modal>
			) }
		</>
	);
}
