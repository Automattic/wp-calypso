import { domainsQuery, siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { siteRoute, siteDomainsRoute, siteSettingsRedirectRoute } from '../../app/router/sites';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AddDomainButton } from '../../domains/add-domain-button';
import {
	useActions,
	useFields,
	DEFAULT_LAYOUTS,
	SITE_CONTEXT_VIEW,
	BulkActionsProgressNotice,
} from '../../domains/dataviews';
import { getDomainConnectionSetupTemplateUrl } from '../../utils/domain-url';
import PrimaryDomainSelector from './primary-domain-selector';
import type { DomainSummary } from '@automattic/api-core';

function getDomainId( domain: DomainSummary ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function SiteDomains() {
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains, isLoading } = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );

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

	const domainConnectionSetupUrl = getDomainConnectionSetupTemplateUrl();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Domains' ) }
					actions={
						<AddDomainButton
							siteSlug={ site.slug }
							domainConnectionSetupUrl={ domainConnectionSetupUrl }
						/>
					}
				/>
			}
			notices={ <BulkActionsProgressNotice /> }
		>
			{ ! isLoading && ! isRedirectLoading && siteDomains && ! hasRedirect && (
				<PrimaryDomainSelector domains={ siteDomains } site={ site } user={ user } />
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

export default SiteDomains;
