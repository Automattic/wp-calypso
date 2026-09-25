import {
	Modal,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import BrowseAllResources from './browse-all-resources';
import ResourceSection from './resource-section';
import { useFilterResources } from './use-filter-resources';
import { getYouTubeEmbedUrl } from './youtube-embed';
import type { ResourceItem, RecordTracksEvent } from './types';

interface ResourceCenterProps {
	resources: ResourceItem[];
	recordTracksEvent?: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
}

export default function ResourceCenter( {
	resources: unsortedResources,
	recordTracksEvent = () => {},
	onResourceClick,
}: ResourceCenterProps ) {
	const [ showVideoModal, setShowVideoModal ] = useState( false );
	const [ selectedResource, setSelectedResource ] = useState< ResourceItem | null >( null );

	const handleOpenVideoModal = ( resource: ResourceItem ) => {
		setSelectedResource( resource );
		setShowVideoModal( true );
	};

	const resources = useMemo(
		() =>
			// Sort by created_at descending (newest first).
			[ ...unsortedResources ].sort(
				( a, b ) => new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime()
			),
		[ unsortedResources ]
	);

	const { topResources, browseAllResources } = useFilterResources( resources );

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						'Browse our guides and articles for agencies, with exclusive materials designed to help you grow and run your agency more effectively. You will find practical guidance, playbooks, and training, including practical ways to recommend the right solutions for your clients.'
					) }
				</Text>
			</Spacer>

			<ResourceSection
				title={ __( 'Top resources' ) }
				resources={ topResources }
				onOpenVideoModal={ handleOpenVideoModal }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ onResourceClick }
				showLogo
				columnMinWidth={ 320 }
				tracksEventName="calypso_a4a_resource_center_top_resource_click"
			/>

			<BrowseAllResources
				resources={ browseAllResources }
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
