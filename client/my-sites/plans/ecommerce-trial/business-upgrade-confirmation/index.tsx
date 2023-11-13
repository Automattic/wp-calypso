import { useTranslate } from 'i18n-calypso';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import BusinessTrialIncluded from 'calypso/my-sites/plans/current-plan/trials/business-trial-included';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const BusinessUpgradeConfirmation = () => {
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'business-trial-upgraded' ] } />
			{ selectedSite && <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> }
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
							{ translate(
								"Your purchase is complete, and you're now on the {{strong}}Business plan{{/strong}}. It's time to take your website to the next level. What would you like to do next?",
								{
									components: { strong: <strong /> },
								}
							) }
						</span>
					</div>
				</div>
				<div className="trial-upgrade-confirmation__tasks">
					<BusinessTrialIncluded displayAll={ true } displayOnlyActionableItems />
				</div>
			</Main>
		</>
	);
};

export default BusinessUpgradeConfirmation;
