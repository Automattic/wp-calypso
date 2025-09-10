import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { CalloutOverlay } from '../../components/callout-overlay';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { hasHostingFeature } from '../../utils/site-features';
import { DeploymentCallout } from './deployment-callout';
import { DeploymentsList } from './deployments-list';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	const hasDeploymentFeature = hasHostingFeature( site, HostingFeatures.DEPLOYMENT );

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
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Trigger deployment' ) }
							</Button>
						</>
					}
				/>
			}
		>
			<CalloutOverlay
				showCallout={ ! hasDeploymentFeature }
				callout={ <DeploymentCallout siteSlug={ site.slug } /> }
				main={ <DeploymentsList /> }
			/>
		</PageLayout>
	);
}

export default SiteDeployments;
