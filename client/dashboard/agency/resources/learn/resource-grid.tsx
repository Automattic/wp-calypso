import Grid from '../../../components/grid';
import ResourceCard from './card';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceGridProps {
	resources: AgencyEnablementResource[];
	onOpenResource: ( resource: AgencyEnablementResource ) => void;
}

export default function ResourceGrid( { resources, onOpenResource }: ResourceGridProps ) {
	return (
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
			{ resources.map( ( item ) => (
				<ResourceCard key={ item.id } resource={ item } onOpen={ onOpenResource } />
			) ) }
		</Grid>
	);
}
