import {
	Modal,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { formatAgencyResources } from 'calypso/a8c-for-agencies/sections/learn/format-agency-resources';
import BrowseAllResources from './browse-all-resources';
import { useFilterResources } from './hooks/use-filter-resources';
import ResourceSection from './resource-section';
import { getYouTubeEmbedUrl } from './utils/youtube-embed';
import type { ResourceItem } from './types';
import type { APIAgencyResourcesResponse } from 'calypso/a8c-for-agencies/data/learn/types';

import './style.scss';

interface ResourceCenterOverviewContentProps {
	data: APIAgencyResourcesResponse | undefined;
}

export default function ResourceCenterOverviewContent( {
	data,
}: ResourceCenterOverviewContentProps ) {
	const [ showVideoModal, setShowVideoModal ] = useState( false );
	const [ selectedResource, setSelectedResource ] = useState< ResourceItem | null >( null );

	const handleOpenVideoModal = ( resource: ResourceItem ) => {
		setSelectedResource( resource );
		setShowVideoModal( true );
	};

	const resources = useMemo( () => {
		if ( ! data?.results ) {
			return [];
		}
		const formattedResources = formatAgencyResources( data.results );
		// Sort by created_at descending (newest first)
		return formattedResources.sort( ( a, b ) => {
			return new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime();
		} );
	}, [ data ] );

	const { topResources, artOfTheDealResources, browseAllResources } =
		useFilterResources( resources );

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						"Explore our resource center for agencies, where you'll find exclusive materials designed to help you sell and integrate Automattic products effectively. These tools not only enhance your sales strategies but also support you in running your agency smoothly and maximizing conversions."
					) }
				</Text>
			</Spacer>

			<ResourceSection
				title={ __( 'Top resources' ) }
				resources={ topResources }
				onOpenVideoModal={ handleOpenVideoModal }
				maxResources={ 3 }
				showLogo
				className="resource-center-top-resources"
				tracksEventName="calypso_a4a_resource_center_top_resource_click"
			/>

			<ResourceSection
				title={ __( 'The art of the deal' ) }
				description={ __( 'Learn tips from our world-class sales team to win clients!' ) }
				resources={ artOfTheDealResources }
				onOpenVideoModal={ handleOpenVideoModal }
				maxResources={ 2 }
				className="resource-center-art-of-deal"
				tracksEventName="calypso_a4a_resource_center_art_of_deal_click"
			/>

			<BrowseAllResources
				resources={ browseAllResources }
				onOpenVideoModal={ handleOpenVideoModal }
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
