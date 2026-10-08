import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { getAudienceLabel, getContentTypeLabel, getStageLabel } from './lib/labels';
import type { FilterResources } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

/** A badge that filters the library by its value. */
function FilterBadge( {
	label,
	intent = 'draft',
	onClick,
}: {
	label: string;
	intent?: 'draft' | 'informational';
	onClick: () => void;
} ) {
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
			<Badge intent={ intent }>{ label }</Badge>
		</button>
	);
}

interface ResourceBadgesProps {
	resource: AgencyEnablementResource;
	onFilter: FilterResources;
	/** Leads with "Top resource" for featured resources, where the header doesn't already show it. */
	showFeatured?: boolean;
}

/** A resource's content type, audience and stage, each of which filters the library. */
export default function ResourceBadges( {
	resource,
	onFilter,
	showFeatured = false,
}: ResourceBadgesProps ) {
	return (
		<HStack spacing={ 1 } justify="flex-start" wrap>
			{ showFeatured && resource.is_featured && (
				<FilterBadge
					label={ __( 'Top resource' ) }
					intent="informational"
					onClick={ () => onFilter( 'featured', 'featured' ) }
				/>
			) }
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
