import { BusinessPlans, EcommercePlans } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { getBackendCalloutProps } from '../backend-callout';

function hasBackendAccess( productSlug: string | undefined ) {
	if ( ! productSlug ) {
		return false;
	}
	return (
		( BusinessPlans as readonly string[] ).includes( productSlug ) ||
		( EcommercePlans as readonly string[] ).includes( productSlug )
	);
}

export default function SitePerformanceBackend( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backend' ) } /> }>
			{ hasBackendAccess( site.plan?.product_slug ) ? (
				<p>{ __( 'Application Performance Monitoring — coming soon.' ) }</p>
			) : (
				<UpsellCallout site={ site } { ...getBackendCalloutProps() } />
			) }
		</PageLayout>
	);
}
