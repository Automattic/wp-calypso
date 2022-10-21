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
			title={ translate( 'Repurchase your plan' ) }
			description={ translate(
				'Your plan expired and your site has reverted back to features available on the Free plan. If you would like to continue using your previous features you must first purchase an eligible plan.{{lineBreak/}}If you wish to continue with Free plan features no further action is needed.',
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
