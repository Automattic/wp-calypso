import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef, useState } from 'react';
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
	BulkActionsProgressNotice,
} from '../../domains/dataviews';
import { isPendingPrimaryDomain } from '../../utils/is-pending-primary-domain';
import PrimaryDomainSelector from './primary-domain-selector';
import type { DomainSummary } from '@automattic/api-core';

function getDomainId( domain: DomainSummary ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function SiteDomains() {
	const { name: dashboardName, queries } = useAppContext();
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains, isLoading } = useQuery( {
		...queries.domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );

	const isCiab = dashboardName === 'CIAB';
	const pendingDomain = isCiab ? siteDomains?.find( isPendingPrimaryDomain ) : undefined;
	const hasPendingDomain = Boolean( pendingDomain );
	const [ isDismissed, setIsDismissed ] = useState( false );

	// Reset dismissed state when the pending domain changes.
	useEffect( () => setIsDismissed( false ), [ pendingDomain?.domain ] );

	// Poll while the primary domain setup is in progress.
	useQuery( {
		...queries.domainsQuery(),
		refetchInterval: hasPendingDomain ? 5000 : false,
		meta: { persist: false },
	} );

	// Show completion snackbar when primary domain setup finishes.
	const { createSuccessNotice } = useDispatch( noticesStore );
	const pendingDomainNameRef = useRef< string | null >( null );
	useEffect( () => {
		if ( pendingDomainNameRef.current && ! hasPendingDomain ) {
			createSuccessNotice(
				sprintf(
					/* translators: %s is the domain name */
					__( '%s is now your store’s primary address.' ),
					pendingDomainNameRef.current
				),
				{ type: 'snackbar' }
			);
		}
		pendingDomainNameRef.current = pendingDomain?.domain ?? null;
	}, [ hasPendingDomain, pendingDomain?.domain, createSuccessNotice ] );

	const { data: redirect, isLoading: isRedirectLoading } = useQuery( siteRedirectQuery( site.ID ) );
	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

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

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		siteDomains ?? [],
		view,
		fields
	);

	// Hide actions column when no domain has eligible actions.
	const hasEligibleActions = siteDomains?.some( ( item ) =>
		actions.some( ( action ) => action.isEligible === undefined || action.isEligible( item ) )
	);

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'Domains' ) } actions={ <AddDomainButton /> } /> }
			notices={ <BulkActionsProgressNotice /> }
		>
			{ ! isLoading &&
				! isRedirectLoading &&
				siteDomains &&
				! hasRedirect &&
				( pendingDomain && ! isDismissed ? (
					<PendingPrimaryDomainNotice
						domainName={ pendingDomain.domain }
						onClose={ () => setIsDismissed( true ) }
					/>
				) : (
					<PrimaryDomainSelector domains={ siteDomains } site={ site } user={ user } />
				) ) }
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
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ updateView }
					onResetView={ resetView }
					view={ view }
					actions={ hasEligibleActions ? actions : [] }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
			{ ! isLoading && <PerformanceTrackerStop /> }
		</PageLayout>
	);
}

export default SiteDomains;
