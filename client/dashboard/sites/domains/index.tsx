import { siteBySlugQuery, domainsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AddDomainButton } from '../../domains/add-domain-button';
import { useActions, useFields, DEFAULT_LAYOUTS, SITE_CONTEXT_VIEW } from '../../domains/dataviews';
import PrimaryDomainSelector from './primary-domain-selector';
import type { DomainsView } from '../../domains/dataviews';
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

	const fields = useFields( {
		site,
	} );

	const actions = useActions( { user, site } );

	const [ view, setView ] = useState< DomainsView >( () => ( {
		...SITE_CONTEXT_VIEW,
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
					actions={ <AddDomainButton siteSlug={ site.slug } /> }
				/>
			}
		>
			{ ! isLoading && siteDomains && (
				<PrimaryDomainSelector domains={ siteDomains } site={ site } user={ user } />
			) }
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

export default SiteDomains;
