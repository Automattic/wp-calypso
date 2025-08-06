import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardHeader, CardBody } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState, useMemo } from 'react';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { CalloutSkeleton } from '../../components/callout-skeleton';
import { SectionHeader } from '../../components/section-header';
import { useFields, actions, DEFAULT_VIEW, DEFAULT_LAYOUTS } from '../../domains/dataviews';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import DomainTransferUpsellCard from '../overview-domain-transfer-upsell-card';
import DomainUpsellCard from '../overview-domain-upsell-card';
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
	const fields = useFields( {
		site,
		showPrimaryDomainBadge: type === 'table',
	} );
	const [ initialView, setView ] = useState< DomainsView >( {
		...DEFAULT_VIEW,
		type,
	} );

	const handleChangeView = ( nextView: View ) => {
		if ( nextView.type === 'grid' ) {
			return;
		}
		setView( nextView );
	};

	const view = useMemo(
		() => ( {
			...initialView,
			type,
			fields: [ ...( type === 'list' ? [ 'is_primary_domain' ] : [] ), 'expiry' ],
		} ),
		[ initialView, type ]
	);

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
					onChangeView={ handleChangeView }
					view={ view }
					actions={ actions }
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

export default function DomainsCard( {
	site,
	isCompact = false,
}: {
	site: Site;
	isCompact?: boolean;
} ) {
	const { data: sitePlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: siteDomains } = useQuery( siteDomainsQuery( site.ID ) );
	const filteredSiteDomains = useMemo( () => {
		// If the site has *.wpcomstaging.com domain, exclude *.wordpress.com
		if ( siteDomains && siteDomains.find( ( domain ) => domain.is_wpcom_staging_domain ) ) {
			return siteDomains.filter(
				( domain ) => ! domain.wpcom_domain || domain.is_wpcom_staging_domain
			);
		}

		return siteDomains;
	}, [ siteDomains ] );

	if ( site.is_wpcom_staging_site ) {
		return null;
	}

	if ( ! sitePlan || ! filteredSiteDomains ) {
		return <CalloutSkeleton />;
	}

	if (
		isSelfHostedJetpackConnected( site ) &&
		filteredSiteDomains.find( ( domain ) => isTransferrableToWpcom( domain ) )
	) {
		return <DomainTransferUpsellCard />;
	}

	if ( ! filteredSiteDomains.find( ( domain ) => ! domain.wpcom_domain ) ) {
		return <DomainUpsellCard site={ site } />;
	}

	return (
		<SiteDomainDataViews
			type={ isCompact ? 'list' : 'table' }
			site={ site }
			domains={ filteredSiteDomains }
		/>
	);
}
