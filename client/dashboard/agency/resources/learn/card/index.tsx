import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { memo } from 'react';
import { Card, CardBody } from '../../../../components/card';
import { getAudienceLabel, getStageLabel } from '../lib/labels';
import ResourceLink from '../resource-link';
import ResourceCardHeader from './header';
import type { FilterResources, OpenResource } from '../types';
import type { AgencyEnablementResource } from '@automattic/api-core';

import './style.scss';

interface ResourceCardProps {
	resource: AgencyEnablementResource;
	onOpen: OpenResource;
	onFilter: FilterResources;
}

/** A badge that filters the library by its value. It sits above the card's stretched link. */
function FilterBadge( { label, onClick }: { label: string; onClick: () => void } ) {
	return (
		<button
			type="button"
			className="dashboard-resources-learn__filter-badge"
			aria-label={
				/* translators: %s: A resource's audience or stage, such as "Learn". */
				sprintf( __( 'Filter by %s' ), label )
			}
			onClick={ onClick }
		>
			<Badge intent="draft">{ label }</Badge>
		</button>
	);
}

function ResourceCard( { resource, onOpen, onFilter }: ResourceCardProps ) {
	return (
		<Card className="dashboard-resources-learn__card">
			<ResourceCardHeader
				resource={ resource }
				title={
					<ResourceLink
						resource={ resource }
						className="dashboard-resources-learn__card-link"
						onOpen={ onOpen }
					/>
				}
			/>
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text variant="muted" className="dashboard-resources-learn__card-description">
						{ resource.description }
					</Text>
					<HStack spacing={ 1 } justify="flex-start" wrap>
						<FilterBadge
							label={ getAudienceLabel( resource.audience ) }
							onClick={ () => onFilter( 'audience', resource.audience ) }
						/>
						<FilterBadge
							label={ getStageLabel( resource.stage ) }
							onClick={ () => onFilter( 'stage', resource.stage ) }
						/>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

// Search and filters re-render the grid, but leave each card's props unchanged.
export default memo( ResourceCard );
