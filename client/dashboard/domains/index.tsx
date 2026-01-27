import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { lazy, Suspense, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../app/performance-tracking';
import { domainsIndexRoute } from '../app/router/domains';
import { DataViews, DataViewsCard } from '../components/dataviews';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import {
	BulkActionsProgressNotice,
	useActions,
	useFields,
	DEFAULT_VIEW,
	DEFAULT_LAYOUTS,
} from './dataviews';
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
	const { queries, components } = useAppContext();
	const AddDomainButton = useMemo( () => lazy( components.addDomainButton ), [ components ] );
	const EmptyDomainsState = useMemo( () => lazy( components.emptyDomainsState ), [ components ] );
	const fields = useFields( { showPrimaryDomainBadge: false } );
	const { data: sites } = useSuspenseQuery( queries.sitesQuery() );
	const actions = useActions( { user, sites } );
	const searchParams = domainsIndexRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'domains',
		defaultView,
		queryParams: searchParams,
	} );

	const { data: domains } = useSuspenseQuery( {
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

	const hasDomains = domains.length > 0;

	return (
		<Suspense fallback={ null }>
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Domains' ) }
						actions={ ! hasDomains ? null : <AddDomainButton /> }
					/>
				}
				notices={
					<>
						<OptInWelcome tracksContext="domains" />
						<BulkActionsProgressNotice />
					</>
				}
			>
				{ ! hasDomains ? (
					<EmptyDomainsState />
				) : (
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
							defaultLayouts={ DEFAULT_LAYOUTS }
						/>
					</DataViewsCard>
				) }
			</PageLayout>
			<PerformanceTrackerStop id="dashboard-domain-list" />
		</Suspense>
	);
}

export default Domains;
