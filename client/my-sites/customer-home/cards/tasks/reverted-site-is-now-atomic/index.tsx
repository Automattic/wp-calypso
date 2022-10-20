import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import { TASK_REVERTED_SITE_NOW_ATOMIC } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

export const RestoreExpiredFeatures = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<Task
			isUrgent
			title={ translate( 'Your features are restored' ) }
			description={ translate(
				'Your site now has access to %(plan)s features again. To begin using these features you can either activate them via {{hosting}}Settings > Hosting Config{{/hosting}}, install a {{plugin}}plugin{{/plugin}} or {{theme}}theme{{/theme}}, or restore your site to the state it was before by selecting a restore point on {{activity}}Jetpack > Activity Log{{/activity}}',
				{
					components: {
						hosting: <a href={ `/hosting-config/${ siteSlug }` }></a>,
						plugin: <a href={ `/plugins/${ siteSlug }` }></a>,
						theme: <a href={ `/themes/${ siteSlug }` }></a>,
						activity: <a href={ `/activity-log/${ siteSlug }` }></a>,
					},
					args: {
						plan: 'Example Plan',
					},
				}
			) }
			timing={ 1 }
			taskId={ TASK_REVERTED_SITE_NOW_ATOMIC }
			actionText={ translate( 'Restore to previous state' ) }
			illustration={ expiredIllustration }
			actionUrl={ `/plans/${ siteSlug }` }
		/>
	);
};
