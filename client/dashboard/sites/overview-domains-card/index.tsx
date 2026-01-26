import { DomainSubtype, type DomainSummary, type Site } from '@automattic/api-core';
import { domainsQuery, siteCurrentPlanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { siteDomainsRoute } from '../../app/router/sites';
import { CalloutSkeleton } from '../../components/callout-skeleton';
import { Card, CardHeader, CardBody } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from '../../domains/dataviews';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { isCommerceGarden, isSelfHostedJetpackConnected } from '../../utils/site-types';
import DomainTransferUpsellCard from '../overview-domain-transfer-upsell-card';
import DomainUpsellCard from '../overview-domain-upsell-card';

const getDomainId = ( domain: DomainSummary ): string => {
	return `${ domain.domain }-${ domain.blog_id }`;
};

const view = {
	...DEFAULT_VIEW,
	fields: [ 'expiry', 'domain_status' ],
};

const onChangeView = () => {};

const SiteDomainDataViews = ( { site, domains }: { site: Site; domains: DomainSummary[] } ) => {
	const router = useRouter();
	const fields = useFields( { site, inOverview: true } );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( domains, view, fields );

	return (
		<Card>
			<CardHeader
				style={ {
					flexDirection: 'column',
					alignItems: 'stretch',
				} }
			>
				<SectionHeader
					title={ __( 'Domain names' ) }
					level={ 3 }
					actions={
						<RouterLinkButton
							variant="secondary"
							size="compact"
							to={
								router.buildLocation( {
									to: siteDomainsRoute.fullPath,
									params: { siteSlug: site.slug },
								} ).href
							}
						>
							{ __( 'Manage domains' ) }
						</RouterLinkButton>
					}
				/>
			</CardHeader>
			<CardBody>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ onChangeView }
					view={ view }
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
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

export default function DomainsCard( { site }: { site: Site } ) {
	const isCommerceGardenSite = isCommerceGarden( site );
	const { data: sitePlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: siteDomains } = useQuery( {
		...domainsQuery(),
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === site.ID ),
	} );

	if ( site.is_wpcom_staging_site ) {
		return null;
	}

	if ( ! sitePlan || ! siteDomains ) {
		// Given that the SiteDomainsDataViews is disabled for the backport,
		// we skip rendering the skeleton here as it might not result in any component being rendered at all.
		// For CIAB (hideUpsells), we also skip the skeleton to avoid CLS when it turns out there are no domains.
		if ( isDashboardBackport() || isCommerceGardenSite ) {
			return null;
		}

		return <CalloutSkeleton />;
	}

	if (
		isSelfHostedJetpackConnected( site ) &&
		siteDomains.find( ( domain ) => isTransferrableToWpcom( domain ) )
	) {
		if ( isCommerceGardenSite ) {
			return null;
		}
		return <DomainTransferUpsellCard />;
	}

	if ( ! siteDomains.find( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS ) ) {
		if ( isCommerceGardenSite ) {
			return null;
		}
		return <DomainUpsellCard site={ site } />;
	}

	if ( isDashboardBackport() ) {
		return null;
	}

	return <SiteDomainDataViews site={ site } domains={ siteDomains } />;
}
