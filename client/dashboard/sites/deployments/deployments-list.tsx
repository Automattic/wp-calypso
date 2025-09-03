import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { useDeploymentFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import { useCodeDeploymentsQuery } from './hooks/use-code-deployments-query';
import type { View } from '@wordpress/dataviews';

export function DeploymentsList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const {
		data: deployments = [],
		isLoading,
		isPlaceholderData,
	} = useCodeDeploymentsQuery( site?.ID ?? null );

	const fields = useDeploymentFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( deployments, view, fields );

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;
	const emptyTitle = hasFilterOrSearch ? __( 'No deployments found' ) : __( 'No deployments yet' );

	return (
		<DataViewsCard>
			<DataViews
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				isLoading={ isLoading || ( isPlaceholderData && filteredData.length === 0 ) }
				defaultLayouts={ DEFAULT_LAYOUTS }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => item.id.toString() }
				empty={ emptyTitle }
			/>
		</DataViewsCard>
	);
}
