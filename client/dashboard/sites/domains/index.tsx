import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteRoute, siteDomainsRoute, siteSettingsRedirectRoute } from '../../app/router/sites';
import {
	DataViews,
	DataViewsActionModal,
	DataViewsCard,
	useDeepLinkedDataViewsAction,
} from '../../components/dataviews';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PendingPrimaryDomainNotice from '../../components/pending-primary-domain-notice';
import AddDomainButton from '../../domains/add-domain-button';
import {
	filterSortAndPaginateDomains,
	getSiteDomainPinnedRank,
	useActions,
	useFields,
	DEFAULT_LAYOUTS,
	SITE_CONTEXT_VIEW,
	useBulkActionsProgressNotice,
} from '../../domains/dataviews';
import {
	canUserSetPrimaryDomain,
	isDomainRenewable,
	isPendingPrimaryDomain,
	isPrimaryDomainCandidate,
} from '../../utils/domain';
import { SitesNoticeArbiter } from '../notice-arbiter';
import ChangePrimaryDomainModal from './change-primary-domain-modal';
import ExpiredDomainNotice from './expired-domain-notice';
import PrimaryDomainSelectorNotice from './primary-domain-selector-notice';
import type { DomainSummary } from '@automattic/api-core';
import '../../domains/dataviews/style.scss';

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
	const expiredDomain = siteDomains.find(
		( domain ) => domain.expired && isDomainRenewable( domain )
	);

	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );
	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const bulkActionsNotice = useBulkActionsProgressNotice();

	const fields = useFields( {
		site,
	} );

	const [ isChangePrimaryDomainOpen, setIsChangePrimaryDomainOpen ] = useState( false );
	const showPrimaryDomainControls = ! hasRedirect && ! pendingDomain;
	const canChangePrimaryDomain =
		showPrimaryDomainControls &&
		canUserSetPrimaryDomain( site, user ) &&
		siteDomains.some( isPrimaryDomainCandidate );

	const openChangePrimaryDomain = useCallback( () => setIsChangePrimaryDomainOpen( true ), [] );

	const sites = useMemo( () => [ site ], [ site ] );
	const actions = useActions( {
		sites,
		onChangePrimaryDomain: canChangePrimaryDomain ? openChangePrimaryDomain : undefined,
	} );

	const searchParams = siteDomainsRoute.useSearch();
	const navigate = useNavigate();

	const deepLinkedAction = useDeepLinkedDataViewsAction( {
		queryParams: searchParams,
		navigate,
		actions,
		items: siteDomains,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-domains',
		defaultView: SITE_CONTEXT_VIEW,
		queryParams: searchParams,
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginateDomains(
		siteDomains,
		view,
		fields,
		{ getPinnedRank: getSiteDomainPinnedRank }
	);

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
						{ expiredDomain && <ExpiredDomainNotice domain={ expiredDomain } /> }
						{ ! hasRedirect && pendingDomain && (
							<PendingPrimaryDomainNotice
								domainName={ pendingDomain.domain }
								onComplete={ () => queryClient.invalidateQueries( queries.domainsQuery() ) }
							/>
						) }
						{ showPrimaryDomainControls && (
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
			<DataViewsCard className="domains-dataviews">
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
			{ deepLinkedAction && <DataViewsActionModal { ...deepLinkedAction } /> }
			{ isChangePrimaryDomainOpen && (
				<ChangePrimaryDomainModal
					site={ site }
					currentPrimaryDomain={ siteDomains.find( ( domain ) => domain.primary_domain )?.domain }
					eligibleDomains={ siteDomains.filter( isPrimaryDomainCandidate ) }
					onClose={ () => setIsChangePrimaryDomainOpen( false ) }
				/>
			) }
			<PerformanceTrackerStop />
		</PageLayout>
	);
}

export default SiteDomains;
