import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../app/performance-tracking';
import { domainsIndexRoute } from '../app/router/domains';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../components/dataviews';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import AddDomainButton from './add-domain-button';
import {
	BulkActionsProgressNotice,
	useActions,
	useFields,
	DEFAULT_VIEW,
	DEFAULT_LAYOUTS,
} from './dataviews';
import EmptyDomainsStateActions from './empty-domains-state/actions';
import { EmptyDomainsStateUpsell } from './empty-domains-state/upsell';
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
		<>
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
					<DataViewsEmptyStateLayout
						title={ __( 'Add your first domain name' ) }
						description={ __( 'Establish a unique online identity for your site.' ) }
					>
						<EmptyDomainsStateActions />
						<EmptyDomainsStateUpsell />
					</DataViewsEmptyStateLayout>
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
							empty={
								<DataViewsEmptyStateLayout
									title={ __( 'No domains match your search' ) }
									description={ __( 'Try again, or add a new domain with the options below.' ) }
									isBorderless
								>
									<EmptyDomainsStateActions />
								</DataViewsEmptyStateLayout>
							}
						/>
					</DataViewsCard>
				) }
			</PageLayout>
			<PerformanceTrackerStop id="dashboard-domain-list" />
		</>
	);
}

export default Domains;
