import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { memo } from 'react';
import { Card, CardBody } from '../../../../components/card';
import ResourceBadges from '../resource-badges';
import ResourceLink from '../resource-link';
import ResourceCardHeader from './header';
import type { FilterResources, SelectResource } from '../types';
import type { AgencyEnablementResource } from '@automattic/api-core';

import './style.scss';

interface ResourceCardProps {
	resource: AgencyEnablementResource;
	onSelect: SelectResource;
	onFilter: FilterResources;
}

function ResourceCard( { resource, onSelect, onFilter }: ResourceCardProps ) {
	return (
		<Card className="dashboard-resources-learn__card" isBorderless>
			<ResourceCardHeader
				resource={ resource }
				title={ <ResourceLink resource={ resource } onSelect={ onSelect } /> }
			/>
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text variant="muted" truncate numberOfLines={ 2 }>
						{ resource.description }
					</Text>
					<ResourceBadges resource={ resource } onFilter={ onFilter } />
				</VStack>
			</CardBody>
		</Card>
	);
}

// Search and filters re-render the grid, but leave each card's props unchanged.
export default memo( ResourceCard );
