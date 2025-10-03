import { siteDomainsQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useActions, useFields, DEFAULT_LAYOUTS, SITE_CONTEXT_VIEW } from '../../domains/dataviews';
import PrimaryDomainSelector from './primary-domain-selector';
import type { DomainsView } from '../../domains/dataviews';
import type { SiteDomain } from '@automattic/api-core';

function getDomainId( domain: SiteDomain ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function SiteDomains() {
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains, isLoading } = useQuery( {
		...siteDomainsQuery( site.ID ),
		select: ( data ) => {
			// If the site has *.wpcomstaging.com domain, exclude *.wordpress.com
			if ( data && data.find( ( domain ) => domain.is_wpcom_staging_domain ) ) {
				return data.filter( ( domain ) => ! domain.wpcom_domain || domain.is_wpcom_staging_domain );
			}

			return data;
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
					actions={
						<Button
							href={ addQueryArgs( '/setup/domain', { siteSlug: site.slug } ) }
							variant="primary"
							__next40pxDefaultSize
						>
							{ __( 'Add New Domain' ) }
						</Button>
					}
				/>
			}
		>
			{ ! isLoading && siteDomains && (
				<PrimaryDomainSelector domains={ siteDomains } site={ site } user={ user } />
			) }
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
