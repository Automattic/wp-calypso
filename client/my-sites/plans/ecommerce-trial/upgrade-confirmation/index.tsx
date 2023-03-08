import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
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

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'ecommerce-trial-upgraded' ] } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-upgraded/:site"
					title="Plans > Ecommerce Trial Post Upgrade Actions"
				/>
				<div className="trial-upgrade-confirmation__header">
					<h1 className="trial-upgrade-confirmation__title">
						{ translate( 'Woo! Welcome to Commerce' ) }
					</h1>
					<div className="trial-upgrade-confirmation__subtitle">
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ translate(
								"Your purchase has been completed and you're on the %(planName)s plan.",
								{
									args: { planName: 'Commerce' },
								}
							) }
						</span>
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ translate( "Now it's time to get creative. What would you like to do next?" ) }
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
