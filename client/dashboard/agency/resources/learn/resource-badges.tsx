import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { getAudienceLabel, getContentTypeLabel, getStageLabel } from './lib/labels';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceBadgesProps {
	resource: AgencyEnablementResource;
	/** Leads with "Top resource" for featured resources, where the header doesn't already show it. */
	showFeatured?: boolean;
}

/** A resource's content type, audience and stage. */
export default function ResourceBadges( { resource, showFeatured = false }: ResourceBadgesProps ) {
	const { content_type: contentType, audience, stage } = resource;

	return (
		<HStack spacing={ 1 } justify="flex-start" wrap>
			{ showFeatured && resource.is_featured && (
				<Badge intent="informational">{ __( 'Top resource' ) }</Badge>
			) }
			{ contentType && <Badge intent="draft">{ getContentTypeLabel( contentType ) }</Badge> }
			{ audience && <Badge intent="draft">{ getAudienceLabel( audience ) }</Badge> }
			{ stage && <Badge intent="draft">{ getStageLabel( stage ) }</Badge> }
		</HStack>
	);
}
