import { __experimentalHStack as HStack } from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import { getAudienceLabel, getContentTypeLabel, getStageLabel } from './lib/labels';
import type { AgencyEnablementResource } from '@automattic/api-core';

/** A resource's content type, audience and stage. */
export default function ResourceBadges( { resource }: { resource: AgencyEnablementResource } ) {
	const { content_type: contentType, audience, stage } = resource;

	return (
		<HStack spacing={ 1 } justify="flex-start" wrap>
			{ contentType && <Badge intent="draft">{ getContentTypeLabel( contentType ) }</Badge> }
			{ audience && <Badge intent="draft">{ getAudienceLabel( audience ) }</Badge> }
			{ stage && <Badge intent="draft">{ getStageLabel( stage ) }</Badge> }
		</HStack>
	);
}
