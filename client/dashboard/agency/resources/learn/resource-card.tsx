import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import { memo } from 'react';
import { Card, CardBody } from '../../../components/card';
import { getAudienceLabel, getStageLabel } from './labels';
import ResourceCardHeader from './resource-card-header';
import ResourceLink from './resource-link';
import type { OpenResource, ResourceItem } from './types';

interface ResourceCardProps {
	resource: ResourceItem;
	onOpen: OpenResource;
}

function ResourceCard( { resource, onOpen }: ResourceCardProps ) {
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
						<Badge intent="draft">{ getAudienceLabel( resource.audience ) }</Badge>
						<Badge intent="draft">{ getStageLabel( resource.stage ) }</Badge>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

// Search and filters re-render the grid, but leave each card's props unchanged.
export default memo( ResourceCard );
