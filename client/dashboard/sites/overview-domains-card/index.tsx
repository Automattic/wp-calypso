import { DomainSubtype, type DomainSummary, type Site } from '@automattic/api-core';
import { domainsQuery, siteCurrentPlanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { CalloutSkeleton } from '../../components/callout-skeleton';
import { Card, CardHeader, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from '../../domains/dataviews';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import DomainTransferUpsellCard from '../overview-domain-transfer-upsell-card';
import DomainUpsellCard from '../overview-domain-upsell-card';
import type { DomainsView } from '../../domains/dataviews';

const getDomainId = ( domain: DomainSummary ): string => {
	return `${ domain.domain }-${ domain.blog_id }`;
};

const SiteDomainDataViews = ( { site, domains }: { site: Site; domains: DomainSummary[] } ) => {
	const fields = useFields( { site, inOverview: true } );

	const [ initialView, setView ] = useState< DomainsView >( {
		...DEFAULT_VIEW,
		type: 'table',
	} );

	const view = useMemo(
		() => ( {
			...initialView,
			type: 'table',
			fields: [ 'domain_status', 'ssl_status' ],
		} ),
		[ initialView ]
	);

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		domains,
		view as View,
		fields
	);

	return (
		<Card>
			<CardHeader
				style={ {
					flexDirection: 'column',
					alignItems: 'stretch',
				} }
			>
				<SectionHeader title={ __( 'Domains' ) } level={ 3 } />
			</CardHeader>
			<CardBody>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( nextView ) => setView( nextView as DomainsView ) }
					view={ view as View }
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
	const { data: sitePlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: siteDomains } = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );

	if ( site.is_wpcom_staging_site ) {
		return null;
	}

	if ( ! sitePlan || ! siteDomains ) {
		return <CalloutSkeleton />;
	}

	if (
		isSelfHostedJetpackConnected( site ) &&
		siteDomains.find( ( domain ) => isTransferrableToWpcom( domain ) )
	) {
		return <DomainTransferUpsellCard />;
	}

	if ( ! siteDomains.find( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS ) ) {
		return <DomainUpsellCard site={ site } />;
	}

	return <SiteDomainDataViews site={ site } domains={ siteDomains } />;
}
