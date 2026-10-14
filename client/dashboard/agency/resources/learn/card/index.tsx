import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { memo, useRef } from 'react';
import { Card, CardBody } from '../../../../components/card';
import ResourceBadges from '../resource-badges';
import ResourceLink from '../resource-link';
import ResourceCardHeader from './header';
import type { SelectResource } from '../types';
import type { AgencyEnablementResource } from '@automattic/api-core';

import './style.scss';

interface ResourceCardProps {
	resource: AgencyEnablementResource;
	onSelect: SelectResource;
}

function ResourceCard( { resource, onSelect }: ResourceCardProps ) {
	const cardRef = useRef< HTMLDivElement >( null );

	return (
		<Card ref={ cardRef } className="dashboard-resources-learn__card" isBorderless>
			<ResourceCardHeader
				resource={ resource }
				title={
					<ResourceLink
						resource={ resource }
						onSelect={ ( item, event ) => onSelect( item, event, cardRef.current ) }
					/>
				}
			/>
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text variant="muted" truncate numberOfLines={ 2 }>
						{ resource.description }
					</Text>
					<ResourceBadges resource={ resource } />
				</VStack>
			</CardBody>
		</Card>
	);
}

// Search and filters re-render the grid, but leave each card's props unchanged.
export default memo( ResourceCard );
