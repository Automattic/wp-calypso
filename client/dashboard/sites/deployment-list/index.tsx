import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { hasHostingFeature } from '../../utils/site-features';
import illustrationUrl from './deployments-callout-illustration.svg';
import { DeploymentsList } from './deployments-list';
import ghIconUrl from './gh-icon.svg';

export function SiteDeploymentsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } /> }
			title={ __( 'Deploy from GitHub' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="deployments"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

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
							<Button variant="secondary" __next40pxDefaultSize>
								{ __( 'Manage repositories' ) }
							</Button>
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
				callout={ <SiteDeploymentsCallout siteSlug={ site.slug } /> }
				main={ <DeploymentsList /> }
			/>
		</PageLayout>
	);
}

export default SiteDeployments;
