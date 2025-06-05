import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SitePlan } from '../../data/types';
import illustrationUrl from './deployments-callout-illustration.svg';
import ghIconUrl from './gh-icon.svg';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteQuery( siteSlug ) );

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
							<RouterLinkButton __next40pxDefaultSize variant="primary" to="#">
								{ __( 'Upgrade plan' ) }
							</RouterLinkButton>
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
