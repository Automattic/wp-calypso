import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../app/auth';
import { domainsQuery } from '../app/queries/domains';
import { domainsPurchaseRoute } from '../app/router/domains';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import RouterLinkButton from '../components/router-link-button';
import { useActions, useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews';
import type { DomainsView } from './dataviews';
import type { DomainSummary } from '../data/types';

export function getDomainId( domain: DomainSummary ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function Domains() {
	const { user } = useAuth();
	const fields = useFields();
	const actions = useActions( { user } );
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
						<RouterLinkButton
							variant="primary"
							__next40pxDefaultSize
							to={ domainsPurchaseRoute.fullPath }
						>
							{ __( 'Add New Domain' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
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
