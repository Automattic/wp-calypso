import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConfirmationTask from './confirmation-task';
import { getConfirmationTasks } from './confirmation-tasks';

import './style.scss';

const TrialUpgradeConfirmation = () => {
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();

	const tasks = getConfirmationTasks( { translate } );

	const taskActionUrlProps = {
		siteName: selectedSite?.name ?? '',
		siteSlug: selectedSite?.slug ?? '',
		wpAdminUrl: selectedSite?.URL ? selectedSite.URL + '/wp-admin/' : '',
		wooAdminUrl: selectedSite?.URL ? selectedSite.URL + '/wp-admin/admin.php?page=wc-admin' : '',
	};

	const currentPlanName = selectedSite?.plan?.product_name_short ?? '';

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'ecommerce-trial-upgraded' ] } />
			<QuerySitePlans siteId={ selectedSite?.ID ?? 0 } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-upgraded/:site"
					title="Plans > Ecommerce Trial Post Upgrade Actions" //Should this string be made available for translation?
				/>
				<div className="trial-upgrade-confirmation__header">
					<h1 className="trial-upgrade-confirmation__title">
						{ translate( 'Woo! Welcome to Woo Express' ) }
					</h1>
					<div className="trial-upgrade-confirmation__subtitle">
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ translate(
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
