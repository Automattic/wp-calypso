import ResourceLink from '../resource-link';
import ResourceProductLogo from '../resource-product-logo';
import type { SelectResource } from '../types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceListCellProps {
	resource: AgencyEnablementResource;
}

/** The title column: a stretched link, so the whole row opens the resource. */
export function ResourceListTitle( {
	resource,
	onSelect,
}: ResourceListCellProps & { onSelect: SelectResource } ) {
	return (
		<span className="dashboard-resources-learn__list-title" data-product={ resource.product }>
			<ResourceLink resource={ resource } onSelect={ onSelect } />
		</span>
	);
}

export function ResourceListProduct( { resource }: ResourceListCellProps ) {
	return (
		<span className="dashboard-resources-learn__list-brand" data-product={ resource.product }>
			<ResourceProductLogo product={ resource.product } />
		</span>
	);
}
