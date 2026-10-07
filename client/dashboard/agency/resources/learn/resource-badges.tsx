import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { getAudienceLabel, getContentTypeLabel, getStageLabel } from './lib/labels';
import type { FilterResources } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

/** A badge that filters the library by its value. */
function FilterBadge( { label, onClick }: { label: string; onClick: () => void } ) {
	return (
		<button
			type="button"
			className="dashboard-resources-learn__filter-badge"
			aria-label={
				/* translators: %s: A resource's content type, audience or stage, such as "Learn". */
				sprintf( __( 'Filter by %s' ), label )
			}
			onClick={ onClick }
		>
			<Badge intent="draft">{ label }</Badge>
		</button>
	);
}

interface ResourceBadgesProps {
	resource: AgencyEnablementResource;
	onFilter: FilterResources;
}

/** A resource's content type, audience and stage, each of which filters the library. */
export default function ResourceBadges( { resource, onFilter }: ResourceBadgesProps ) {
	return (
		<HStack spacing={ 1 } justify="flex-start" wrap>
			<FilterBadge
				label={ getContentTypeLabel( resource.content_type ) }
				onClick={ () => onFilter( 'content_type', resource.content_type ) }
			/>
			<FilterBadge
				label={ getAudienceLabel( resource.audience ) }
				onClick={ () => onFilter( 'audience', resource.audience ) }
			/>
			<FilterBadge
				label={ getStageLabel( resource.stage ) }
				onClick={ () => onFilter( 'stage', resource.stage ) }
			/>
		</HStack>
	);
}
