import { Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import BrowseAllResources from './browse-all-resources';
import { getYouTubeEmbedUrl } from './youtube-embed';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { View } from '@wordpress/dataviews';

export const getResourceCenterDescription = () =>
	__( 'Resources to help you learn, win clients, and deliver great work.' );

interface ResourceCenterProps {
	resources: ResourceItem[];
	view: View;
	onChangeView: ( view: View ) => void;
	recordTracksEvent?: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
}

export default function ResourceCenter( {
	resources: unsortedResources,
	view,
	onChangeView,
	recordTracksEvent = () => {},
	onResourceClick,
}: ResourceCenterProps ) {
	const [ showVideoModal, setShowVideoModal ] = useState( false );
	const [ selectedResource, setSelectedResource ] = useState< ResourceItem | null >( null );

	const handleOpenVideoModal = useCallback( ( resource: ResourceItem ) => {
		setSelectedResource( resource );
		setShowVideoModal( true );
	}, [] );

	const resources = useMemo(
		() =>
			// Featured first, then by created_at descending (newest first).
			[ ...unsortedResources ].sort(
				( a, b ) =>
					Number( b.isFeatured ) - Number( a.isFeatured ) ||
					new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime()
			),
		[ unsortedResources ]
	);

	return (
		<>
			<BrowseAllResources
				resources={ resources }
				view={ view }
				onChangeView={ onChangeView }
				onOpenVideoModal={ handleOpenVideoModal }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ onResourceClick }
			/>

			{ showVideoModal && selectedResource && (
				<Modal
					isDismissible
					size="large"
					onRequestClose={ () => setShowVideoModal( false ) }
					title={ selectedResource.name }
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
								src={ getYouTubeEmbedUrl( selectedResource.externalUrl ) }
								title={ selectedResource.name }
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
