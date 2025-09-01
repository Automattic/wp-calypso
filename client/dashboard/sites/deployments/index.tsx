import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { hasHostingFeature } from '../../utils/site-features';
import illustrationUrl from './deployments-callout-illustration.svg';
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

	return (
		<PageLayout header={ <PageHeader title={ __( 'Deployments' ) } /> }>
			<CalloutOverlay
				showCallout={ ! hasHostingFeature( site, HostingFeatures.DEPLOYMENT ) }
				callout={ <SiteDeploymentsCallout siteSlug={ site.slug } /> }
				main={
					<DataViewsCard>
						<></>
					</DataViewsCard>
				}
			/>
		</PageLayout>
	);
}

export default SiteDeployments;
