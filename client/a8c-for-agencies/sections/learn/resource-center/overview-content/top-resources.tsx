import { __ } from '@wordpress/i18n';
import ResourceSection from './resource-section';
import type { ResourceItem } from './types';

interface TopResourcesProps {
	resources: ResourceItem[];
	isLoading: boolean;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
}

export default function TopResources( {
	resources,
	isLoading,
	onOpenVideoModal,
}: TopResourcesProps ) {
	return (
		<ResourceSection
			title={ __( 'Top resources' ) }
			resources={ resources }
			isLoading={ isLoading }
			onOpenVideoModal={ onOpenVideoModal }
			maxResources={ 3 }
			showLogo
			className="resource-center-top-resources"
			tracksEventName="calypso_a4a_resource_center_top_resource_click"
		/>
	);
}
