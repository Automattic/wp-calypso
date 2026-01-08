import { __ } from '@wordpress/i18n';
import ResourceSection from './resource-section';
import type { ResourceItem } from './types';

interface ArtOfTheDealProps {
	resources: ResourceItem[];
	isLoading: boolean;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
}

export default function ArtOfTheDeal( {
	resources,
	isLoading,
	onOpenVideoModal,
}: ArtOfTheDealProps ) {
	return (
		<ResourceSection
			title={ __( 'The art of the deal' ) }
			description={ __( 'Learn tips from our world-class sales team to win clients!' ) }
			resources={ resources }
			isLoading={ isLoading }
			onOpenVideoModal={ onOpenVideoModal }
			maxResources={ 2 }
			className="resource-center-art-of-deal"
			tracksEventName="calypso_a4a_resource_center_art_of_deal_click"
		/>
	);
}
