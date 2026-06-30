import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteRoute, siteDomainsRoute, siteSettingsRedirectRoute } from '../../app/router/sites';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PendingPrimaryDomainNotice from '../../components/pending-primary-domain-notice';
import AddDomainButton from '../../domains/add-domain-button';
import {
	useActions,
	useFields,
	DEFAULT_LAYOUTS,
	SITE_CONTEXT_VIEW,
	useBulkActionsProgressNotice,
} from '../../domains/dataviews';
import { isPendingPrimaryDomain } from '../../utils/domain';
import { SitesNoticeArbiter } from '../notice-arbiter';
import PrimaryDomainSelectorNotice from './primary-domain-selector-notice';
import type { DomainSummary } from '@automattic/api-core';

function getDomainId( domain: DomainSummary ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function SiteDomains() {
	const queryClient = useQueryClient();
	const { queries } = useAppContext();
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains } = useSuspenseQuery( {
		...queries.domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );

	const pendingDomain = siteDomains.find( isPendingPrimaryDomain );

	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );
	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const bulkActionsNotice = useBulkActionsProgressNotice();

	const fields = useFields( {
		site,
	} );

	const actions = useActions( { user, sites: [ site ] } );

	const searchParams = siteDomainsRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-domains',
		defaultView: SITE_CONTEXT_VIEW,
		queryParams: searchParams,
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( siteDomains, view, fields );

	// Hide actions column when no domain has eligible actions.
	const hasEligibleActions = siteDomains.some( ( item ) =>
		actions.some( ( action ) => action.isEligible === undefined || action.isEligible( item ) )
	);

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'Domains' ) } actions={ <AddDomainButton /> } /> }
			notices={
				<>
					{ /* Action feedback, not an on-load banner: rendered outside the arbiter. */ }
					{ bulkActionsNotice }
					<SitesNoticeArbiter>
						{ ! hasRedirect && pendingDomain && (
							<PendingPrimaryDomainNotice
								domainName={ pendingDomain.domain }
								onComplete={ () => queryClient.invalidateQueries( queries.domainsQuery() ) }
							/>
						) }
						{ ! hasRedirect && ! pendingDomain && (
							<PrimaryDomainSelectorNotice domains={ siteDomains } site={ site } user={ user } />
						) }
						{ hasRedirect && (
							<Notice variant="warning">
								{ createInterpolateElement(
									__(
										'This site <site/> and all domains attached to it will redirect to <redirect/>. If you want to change that <link>click here</link>.'
									),
									{
										site: <b>{ site.slug }</b>,
										redirect: <b>{ redirect.location }</b>,
										link: (
											<Link
												to={ siteSettingsRedirectRoute.fullPath }
												params={ { siteSlug: site.slug } }
											/>
										),
									}
								) }
							</Notice>
						) }
					</SitesNoticeArbiter>
				</>
			}
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ updateView }
					onReset={ resetView }
					view={ view }
					actions={ hasEligibleActions ? actions : [] }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
			<PerformanceTrackerStop />
		</PageLayout>
	);
}

export default SiteDomains;
