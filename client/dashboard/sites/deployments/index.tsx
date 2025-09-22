import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, codeDeploymentsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getDeploymentsCalloutProps } from './deployments-callout';
import { DeploymentsList } from './deployments-list';
import { TriggerDeploymentModal } from './trigger-deployment-modal';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ isModalTriggerDeploymentOpen, setIsModalTriggerDeploymentOpen ] = useState( false );
	const { data: deployments = [], isLoading: isLoadingDeployments } = useQuery(
		codeDeploymentsQuery( site.ID )
	);

	if ( ! site ) {
		return;
	}

	let titleForManualDeploymentButton;
	if ( isLoadingDeployments ) {
		titleForManualDeploymentButton = __( 'Loading repositories…' );
	} else if ( ! deployments.length ) {
		titleForManualDeploymentButton = __( 'No connected repositories' );
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Deployments' ) }
					actions={
						<>
							<RouterLinkButton
								to="/sites/$siteSlug/settings/repositories"
								params={ { siteSlug } }
								variant="secondary"
								__next40pxDefaultSize
							>
								{ __( 'Manage repositories' ) }
							</RouterLinkButton>
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () => {
									setIsModalTriggerDeploymentOpen( true );
								} }
								disabled={ isLoadingDeployments || ! deployments.length }
								title={ titleForManualDeploymentButton }
							>
								{ __( 'Trigger deployment' ) }
							</Button>
						</>
					}
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.DEPLOYMENT }
				asOverlay
				{ ...getDeploymentsCalloutProps() }
			>
				<DeploymentsList />
			</HostingFeatureGatedWithCallout>

			{ isModalTriggerDeploymentOpen && (
				<TriggerDeploymentModal
					onClose={ () => setIsModalTriggerDeploymentOpen( false ) }
					deployments={ deployments }
				/>
			) }
		</PageLayout>
	);
}

export default SiteDeployments;
