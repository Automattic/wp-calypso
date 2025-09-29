import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../app/auth';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { useActions, useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews';
import type { DomainsView } from './dataviews';
import type { DomainSummary } from '@automattic/api-core';

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
						<Button variant="primary" __next40pxDefaultSize href="/setup/domain">
							{ __( 'Add New Domain' ) }
						</Button>
					}
				/>
			}
			notices={ <OptInWelcome tracksContext="domains" /> }
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
