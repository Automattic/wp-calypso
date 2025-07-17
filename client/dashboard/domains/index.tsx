import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainsQuery } from '../app/queries/domains';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { actions, fields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews';
import type { DomainsView } from './dataviews';
import type { Domain } from '../data/types';

export function getDomainId( domain: Domain ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function Domains() {
	const [ view, setView ] = useState< DomainsView >( () => ( {
		...DEFAULT_VIEW,
		type: 'table',
	} ) );

	const { data: domains, isLoading } = useQuery( domainsQuery() );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		domains ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Domains' ) }
					actions={
						<Button variant="primary" __next40pxDefaultSize>
							{ __( 'Add New Domain' ) }
						</Button>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews< Domain >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( nextView ) => setView( () => nextView as DomainsView ) }
					view={ view }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default Domains;
