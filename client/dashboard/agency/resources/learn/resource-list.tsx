import { DataViews } from '@wordpress/dataviews';
import ResourceLink from './resource-link';
import ResourceProductLogo from './resource-product-logo';
import type { OpenResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceListCellProps {
	resource: AgencyEnablementResource;
}

/** The title column: a stretched link, so the whole row opens the resource. */
export function ResourceListTitle( {
	resource,
	onOpen,
}: ResourceListCellProps & { onOpen: OpenResource } ) {
	return (
		<span className="dashboard-resources-learn__list-title" data-product={ resource.product }>
			<ResourceLink
				resource={ resource }
				className="dashboard-resources-learn__list-link"
				onOpen={ onOpen }
			/>
		</span>
	);
}

/** The product column: the product's wordmark. */
export function ResourceListProduct( { resource }: ResourceListCellProps ) {
	return (
		<span className="dashboard-resources-learn__list-brand" data-product={ resource.product }>
			<ResourceProductLogo product={ resource.product } />
		</span>
	);
}

/**
 * The list layout: DataViews' table, with columns from `useResourceFields`.
 * Renders inside the library's `DataViews`, which supplies its data and view.
 */
export default function ResourceList() {
	return <DataViews.Layout />;
}
