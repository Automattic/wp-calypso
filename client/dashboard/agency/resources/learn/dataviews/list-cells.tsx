import ResourceProductLogo from '../resource-product-logo';
import type { AgencyEnablementResource } from '@automattic/api-core';

export function ResourceListProduct( { resource }: { resource: AgencyEnablementResource } ) {
	return (
		<span className="dashboard-resources-learn__list-brand" data-product={ resource.product }>
			<ResourceProductLogo product={ resource.product } />
		</span>
	);
}
