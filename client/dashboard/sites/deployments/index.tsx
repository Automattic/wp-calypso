import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { SitePlan } from '../../data/types';
import illustrationUrl from './deployments-callout-illustration.svg';
import ghIconUrl from './gh-icon.svg';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	const showIneligiblePlanCallout = ! site.plan || ! hasDeploymentsFeature( site.plan );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Deployments' ) } /> }>
			<CalloutOverlay
				showCallout={ showIneligiblePlanCallout }
				callout={
					<Callout
						icon={ <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } /> }
						title={ __( 'Deploy from GitHub' ) }
						titleAs="h1"
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
							/>
						}
					/>
				}
				main={
					<DataViewsCard>
						<></>
					</DataViewsCard>
				}
			/>
		</PageLayout>
	);
}

function hasDeploymentsFeature( plan: SitePlan ) {
	return plan.features.active.includes( 'atomic' );
}

export default SiteDeployments;
