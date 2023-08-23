import { useTranslate } from 'i18n-calypso';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useBusinessTrialIncludedFeatures from '../../current-plan/trials/use-business-trial-included-features';
import ConfirmationTask from '../upgrade-confirmation/confirmation-task';
import type { AppState } from 'calypso/types';

import './style.scss';

const BusinessUpgradeConfirmation = () => {
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();
	const wpAdminUrl = selectedSite?.URL ? selectedSite.URL + '/wp-admin/' : '';
	const includedFeatures = useBusinessTrialIncludedFeatures(
		selectedSite?.slug ?? '',
		wpAdminUrl ?? ''
	);

	const isFetchingSitePlan = useSelector( ( state: AppState ) => {
		if ( ! selectedSite?.ID ) {
			return false;
		}
		return isRequestingSitePlans( state, selectedSite.ID );
	} );

	const currentPlanName = isFetchingSitePlan ? '' : selectedSite?.plan?.product_name_short ?? '';

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'business-trial-upgraded' ] } />
			<QuerySitePlans siteId={ selectedSite?.ID ?? 0 } />
			<QueryJetpackPlugins siteIds={ [ selectedSite?.ID ?? 0 ] } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-upgraded/:site"
					title="Plans > Business Trial Post Upgrade Actions"
				/>
				<div className="trial-upgrade-confirmation__header">
					<h1 className="trial-upgrade-confirmation__title">
						{ translate( 'Welcome to the Business plan' ) }
					</h1>
					<div className="trial-upgrade-confirmation__subtitle">
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ currentPlanName &&
								translate(
									"Your purchase is complete, and you're now on the {{strong}}%(planName)s plan{{/strong}}. It's time to take your website to the next level. What would you like to do next?",
									{
										args: { planName: currentPlanName },
										components: { strong: <strong /> },
									}
								) }
						</span>
					</div>
				</div>
				<div className="trial-upgrade-confirmation__tasks">
					{ includedFeatures
						.filter( ( x ) => x.showButton )
						.map( ( feature ) => (
							<ConfirmationTask
								id={ feature.id }
								key={ feature.id }
								context="business_trial"
								title={ feature.title }
								subtitle={ feature.text }
								illustration={ feature.illustration }
								buttonText={ feature.buttonText }
								onButtonClick={ feature.buttonClick }
							/>
						) ) }
				</div>
			</Main>
		</>
	);
};

export default BusinessUpgradeConfirmation;
