import { agencyResourceEventMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import BrowseAllResources from './browse-all-resources';
import { getYouTubeEmbedUrl } from './youtube-embed';
import type { ResourceItem, RecordTracksEvent } from './types';

interface ResourceCenterProps {
	resources: ResourceItem[];
	recordTracksEvent?: RecordTracksEvent;
	/** The agency opened resources are recorded against, once it has loaded. */
	agencyId: number | undefined;
}

export default function ResourceCenter( {
	resources: unsortedResources,
	recordTracksEvent = () => {},
	agencyId,
}: ResourceCenterProps ) {
	const [ showVideoModal, setShowVideoModal ] = useState( false );
	const [ selectedResource, setSelectedResource ] = useState< ResourceItem | null >( null );

	const { mutate: recordResourceEvent } = useMutation(
		agencyResourceEventMutation( agencyId ?? 0 )
	);

	const handleResourceClick = useCallback(
		( resource: ResourceItem ) => {
			if ( agencyId ) {
				recordResourceEvent( { resource_id: resource.id, resource_name: resource.name } );
			}
		},
		[ agencyId, recordResourceEvent ]
	);

	const handleOpenVideoModal = ( resource: ResourceItem ) => {
		setSelectedResource( resource );
		setShowVideoModal( true );
	};

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
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						'Browse our guides and articles for agencies, with exclusive materials designed to help you grow and run your agency more effectively. You will find practical guidance, playbooks, and training, including practical ways to recommend the right solutions for your clients.'
					) }
				</Text>
			</Spacer>

			<BrowseAllResources
				resources={ resources }
				onOpenVideoModal={ handleOpenVideoModal }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ handleResourceClick }
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
