import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView, DataViews } from '../app/dataviews';
import { domainsRoute } from '../app/router/domains';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { AddDomainButton } from './add-domain-button';
import { useActions, useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews';
import type { DomainSummary } from '@automattic/api-core';

export function getDomainId( domain: DomainSummary ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}

const defaultView = {
	...DEFAULT_VIEW,
	filters: [
		{
			field: 'owner',
			operator: 'isAny' as const,
			value: [ 'owned-by-me' ],
		},
	],
};

function Domains() {
	const { user } = useAuth();
	const { queries } = useAppContext();
	const fields = useFields();
	const { data: sites } = useQuery( queries.sitesQuery() );
	const actions = useActions( { user, sites } );
	const searchParams = domainsRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'domains',
		defaultView,
		queryParams: searchParams,
	} );

	const { data: domains, isLoading } = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		},
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		domains ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'Domains' ) } actions={ <AddDomainButton /> } /> }
			notices={ <OptInWelcome tracksContext="domains" /> }
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ updateView }
					onResetView={ resetView }
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
