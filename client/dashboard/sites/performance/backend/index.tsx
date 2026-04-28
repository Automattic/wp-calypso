import { BusinessPlans, EcommercePlans } from '@automattic/api-core';
import { siteApmEnabledMutation, siteBySlugQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody, CardFooter } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { getBackendCalloutProps } from '../backend-callout';
import EnableApmCallout from './enable-apm-callout';
import type { Site } from '@automattic/api-core';

function hasBackendAccess( productSlug: string | undefined ) {
	if ( ! productSlug ) {
		return false;
	}
	return (
		( BusinessPlans as readonly string[] ).includes( productSlug ) ||
		( EcommercePlans as readonly string[] ).includes( productSlug )
	);
}

function ApmEnabledPlaceholder( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const { mutate, isPending } = useMutation( {
		...siteApmEnabledMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'APM disabled.' ),
				error: __( 'Failed to disable APM.' ),
			},
		},
	} );

	const handleDisable = () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_disable_click' );
		mutate( false );
	};

	return (
		<Card>
			<CardBody>{ __( 'APM dashboards coming soon.' ) }</CardBody>
			<CardFooter>
				<Button
					variant="secondary"
					isBusy={ isPending }
					disabled={ isPending }
					onClick={ handleDisable }
				>
					{ __( 'Disable' ) }
				</Button>
			</CardFooter>
		</Card>
	);
}

export default function SitePerformanceBackend( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const renderContent = () => {
		if ( ! hasBackendAccess( site.plan?.product_slug ) ) {
			return <UpsellCallout site={ site } { ...getBackendCalloutProps() } />;
		}

		return site.options?.apm_enabled ? (
			<ApmEnabledPlaceholder site={ site } />
		) : (
			<EnableApmCallout site={ site } />
		);
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backend' ) } /> }>{ renderContent() }</PageLayout>
	);
}
