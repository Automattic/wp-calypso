import Grid from '../../../components/grid';
import ResourceCard from './card';
import type { FilterResources, OpenResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceGridProps {
	resources: AgencyEnablementResource[];
	onOpenResource: OpenResource;
	onFilterResources: FilterResources;
}

export default function ResourceGrid( {
	resources,
	onOpenResource,
	onFilterResources,
}: ResourceGridProps ) {
	return (
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
			{ resources.map( ( item ) => (
				<ResourceCard
					key={ item.id }
					resource={ item }
					onOpen={ onOpenResource }
					onFilter={ onFilterResources }
				/>
			) ) }
		</Grid>
	);
}
