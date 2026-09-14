import { type Site } from '@automattic/api-core';
import { siteApmEnabledMutation, siteBySlugQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import { hasBackendAccess } from '../performance/backend-access';
import { getBackendCalloutProps } from '../performance/backend-callout';

function ApmToggle( { site }: { site: Site } ) {
	const enabled = !! site.options?.apm_enabled;
	const { mutate, isPending } = useMutation(
		withSnackbar( siteApmEnabledMutation( site.ID ), {
			success: enabled ? __( 'APM disabled.' ) : __( 'APM enabled.' ),
			error: enabled ? __( 'Failed to disable APM.' ) : __( 'Failed to enable APM.' ),
		} )
	);

	const handleClick = () => mutate( ! enabled );

	if ( enabled ) {
		return (
			<Notice
				variant="success"
				title={ __( 'APM is enabled' ) }
				actions={
					<Button
						variant="primary"
						size="compact"
						isBusy={ isPending }
						disabled={ isPending }
						onClick={ handleClick }
					>
						{ __( 'Disable' ) }
					</Button>
				}
			/>
		);
	}

	return (
		<Notice
			title={ __( 'APM is disabled' ) }
			actions={
				<Button
					variant="primary"
					size="compact"
					isBusy={ isPending }
					disabled={ isPending }
					onClick={ handleClick }
				>
					{ __( 'Enable' ) }
				</Button>
			}
		/>
	);
}

export default function ApmSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Application Performance Monitoring' ) }
					description={ createInterpolateElement(
						__(
							'Get request-level tracing, top slow endpoints, and plugin bottleneck detection for your site. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="site-performance" />,
						}
					) }
				/>
			}
		>
			{ hasBackendAccess( site.plan?.product_slug ) ? (
				<ApmToggle site={ site } />
			) : (
				<UpsellCallout site={ site } { ...getBackendCalloutProps() } />
			) }
		</PageLayout>
	);
}
