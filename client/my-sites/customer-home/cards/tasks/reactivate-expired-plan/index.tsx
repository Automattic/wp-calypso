import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import { TASK_REACTIVATE_EXPIRED_PLAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

export const ReactivateExpiredPlan = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<Task
			isUrgent
			title={ translate( 'Restore your plan' ) }
			description={ translate(
				'Your plan expired and your site reverted to the Free plan. If you would like to continue using your previous features, you must first purchase an eligible plan.{{lineBreak/}}No further action is needed if you wish to continue with the Free plan.',
				{
					components: {
						lineBreak: (
							<>
								<br />
								<br />
							</>
						),
					},
				}
			) }
			timing={ 1 }
			taskId={ TASK_REACTIVATE_EXPIRED_PLAN }
			actionText={ translate( 'Restore plan' ) }
			illustration={ expiredIllustration }
			actionUrl={ `/plans/${ siteSlug }` }
		/>
	);
};
