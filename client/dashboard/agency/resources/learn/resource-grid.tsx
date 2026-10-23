import Grid from '../../../components/grid';
import ResourceCard from './card';
import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceGridProps {
	resources: AgencyEnablementResource[];
	onSelectResource: SelectResource;
}

export default function ResourceGrid( { resources, onSelectResource }: ResourceGridProps ) {
	return (
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
			{ resources.map( ( item ) => (
				<ResourceCard key={ item.id } resource={ item } onSelect={ onSelectResource } />
			) ) }
		</Grid>
	);
}
