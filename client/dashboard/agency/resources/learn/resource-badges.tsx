import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { getAudienceLabel, getContentTypeLabel, getStageLabel } from './lib/labels';
import type { FilterResources } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

/**
 * A badge that filters the library by its value. A plain button, as `Button`'s
 * own size, padding and focus styles would draw a second shape around the badge.
 */
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
	const { content_type: contentType, audience, stage } = resource;

	return (
		<HStack spacing={ 1 } justify="flex-start" wrap>
			{ contentType && (
				<FilterBadge
					label={ getContentTypeLabel( contentType ) }
					onClick={ () => onFilter( 'content_type', contentType ) }
				/>
			) }
			{ audience && (
				<FilterBadge
					label={ getAudienceLabel( audience ) }
					onClick={ () => onFilter( 'audience', audience ) }
				/>
			) }
			{ stage && (
				<FilterBadge
					label={ getStageLabel( stage ) }
					onClick={ () => onFilter( 'stage', stage ) }
				/>
			) }
		</HStack>
	);
}
