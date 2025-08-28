import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { siteDomainsPurchaseRoute, siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { useActions, useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from '../../domains/dataviews';
import type { SiteDomain } from '../../data/types';
import type { DomainsView } from '../../domains/dataviews';

function getDomainId( domain: SiteDomain ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function SiteDomains() {
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains, isLoading } = useQuery( siteDomainsQuery( site.ID ) );
	const fields = useFields( {
		site,
	} );

	const actions = useActions( { user, site } );

	const [ view, setView ] = useState< DomainsView >( () => ( {
		...DEFAULT_VIEW,
		type: 'table',
	} ) );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		siteDomains ?? [],
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
							to={ siteDomainsPurchaseRoute.fullPath }
							params={ { siteSlug } }
							variant="primary"
						>
							{ __( 'Add New Domain' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews< SiteDomain >
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

export default SiteDomains;
