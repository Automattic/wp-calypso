import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardHeader, CardBody } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { SectionHeader } from '../../components/section-header';
import { useFields, actions, DEFAULT_VIEW, DEFAULT_LAYOUTS } from '../../domains/dataviews';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import OverviewCardUpsellDomain, {
	OverviewCardUpsellDomainTransfer,
} from '../overview-card-upsell-domain';
import type { Site, SiteDomain } from '../../data/types';
import type { DomainsView } from '../../domains/dataviews';

const getDomainId = ( domain: SiteDomain ): string => {
	return `${ domain.domain }-${ domain.blog_id }`;
};

const SiteDomainDataViews = ( {
	site,
	domains,
	type = 'table',
}: {
	site: Site;
	domains: SiteDomain[];
	type?: DomainsView[ 'type' ];
} ) => {
	const fields = useFields( { site } );
	const [ view, setView ] = useState< DomainsView >( {
		...DEFAULT_VIEW,
		fields: [ 'expiry' ],
		type,
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( domains, view, fields );

	useEffect( () => {
		if ( type ) {
			setView( ( currentView ) => ( { ...currentView, type } ) );
		}
	}, [ type ] );

	return (
		<Card>
			<CardHeader
				style={ {
					flexDirection: 'column',
					alignItems: 'stretch',
				} }
			>
				<SectionHeader
					title={ __( 'Domains' ) }
					level={ 3 }
					actions={
						<>
							<Button
								variant="tertiary"
								size="compact"
								href={ addQueryArgs( `/domains/add/use-my-domain/${ site.slug }`, {
									redirect_to: window.location.pathname,
								} ) }
							>
								{ __( 'Transfer domain' ) }
							</Button>
							<Button
								variant="secondary"
								size="compact"
								href={ addQueryArgs( `/domains/add/${ site.slug }`, {
									redirect_to: window.location.pathname,
								} ) }
							>
								{ __( 'Add domain' ) }
							</Button>
						</>
					}
				/>
			</CardHeader>
			<CardBody>
				<DataViews< SiteDomain >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( nextView ) => setView( () => nextView as DomainsView ) }
					view={ view }
					actions={ actions }
					search={ false }
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ false }
					defaultLayouts={ DEFAULT_LAYOUTS }
				>
					<>
						<DataViews.Layout />
						<DataViews.Pagination />
					</>
				</DataViews>
			</CardBody>
		</Card>
	);
};

export default function DomainsCard( {
	site,
	isCompact = false,
}: {
	site: Site;
	isCompact?: boolean;
} ) {
	const { data: sitePlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: siteDomains } = useQuery( siteDomainsQuery( site.ID ) );

	if ( ! sitePlan || ! siteDomains ) {
		return null;
	}

	if (
		isSelfHostedJetpackConnected( site ) &&
		siteDomains.find( ( domain ) => isTransferrableToWpcom( domain ) )
	) {
		return <OverviewCardUpsellDomainTransfer />;
	}

	if ( ! siteDomains.find( ( domain ) => ! domain.wpcom_domain ) ) {
		return <OverviewCardUpsellDomain site={ site } />;
	}

	return (
		<SiteDomainDataViews
			type={ isCompact ? 'list' : 'table' }
			site={ site }
			domains={ siteDomains }
		/>
	);
}
