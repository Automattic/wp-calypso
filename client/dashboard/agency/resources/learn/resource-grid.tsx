import Grid from '../../../components/grid';
import ResourceCard from './card';
import type { FilterResources, SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceGridProps {
	resources: AgencyEnablementResource[];
	onSelectResource: SelectResource;
	onFilterResources: FilterResources;
}

export default function ResourceGrid( {
	resources,
	onSelectResource,
	onFilterResources,
}: ResourceGridProps ) {
	return (
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
			{ resources.map( ( item ) => (
				<ResourceCard
					key={ item.id }
					resource={ item }
					onSelect={ onSelectResource }
					onFilter={ onFilterResources }
				/>
			) ) }
		</Grid>
	);
}
