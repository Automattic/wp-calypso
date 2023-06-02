import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConfirmationTask from './confirmation-task';
import { getConfirmationTasks } from './confirmation-tasks';
import type { AppState } from 'calypso/types';

import './style.scss';

const TrialUpgradeConfirmation = () => {
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();
	const siteId = selectedSite?.ID;
	const hasWCPay = useSelector(
		( state ) => siteId && isPluginActive( state, siteId, 'woocommerce-payments' )
	) as boolean;
	const tasks = useMemo(
		() => getConfirmationTasks( { translate, hasWCPay } ),
		[ translate, hasWCPay ]
	);

	const taskActionUrlProps = {
		siteName: selectedSite?.name ?? '',
		siteSlug: selectedSite?.slug ?? '',
		wpAdminUrl: selectedSite?.URL ? selectedSite.URL + '/wp-admin/' : '',
		wooAdminUrl: selectedSite?.URL ? selectedSite.URL + '/wp-admin/admin.php?page=wc-admin' : '',
	};

	const isFetchingSitePlan = useSelector( ( state: AppState ) => {
		if ( ! selectedSite?.ID ) {
			return false;
		}
		return isRequestingSitePlans( state, selectedSite.ID );
	} );

	const currentPlanName = isFetchingSitePlan ? '' : selectedSite?.plan?.product_name_short ?? '';

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'ecommerce-trial-upgraded' ] } />
			<QuerySitePlans siteId={ selectedSite?.ID ?? 0 } />
			<QueryJetpackPlugins siteIds={ [ selectedSite?.ID ?? 0 ] } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-upgraded/:site"
					title="Plans > Ecommerce Trial Post Upgrade Actions"
				/>
				<div className="trial-upgrade-confirmation__header">
					<h1 className="trial-upgrade-confirmation__title">
						{ translate( 'Woo! Welcome to Woo Express' ) }
					</h1>
					<div className="trial-upgrade-confirmation__subtitle">
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ currentPlanName &&
								translate(
									"Your purchase is complete and you're now on the {{strong}}%(planName)s plan{{/strong}}. Now it's time to take your store to the next level. What would you like to do next?",
									{
										args: { planName: currentPlanName },
										components: { strong: <strong /> },
									}
								) }
						</span>
					</div>
				</div>
				<div className="trial-upgrade-confirmation__tasks">
					{ tasks.map( ( task ) => (
						<ConfirmationTask
							key={ task.id }
							{ ...task }
							taskActionUrlProps={ taskActionUrlProps }
						/>
					) ) }
				</div>
			</Main>
		</>
	);
};

export default TrialUpgradeConfirmation;
