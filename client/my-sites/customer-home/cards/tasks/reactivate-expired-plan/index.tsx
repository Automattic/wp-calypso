import { useSelector } from 'react-redux';
import { TASK_REACTIVATE_EXPIRED_PLAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
import { getTask } from './get-task';

export const ReactivateExpiredPlan = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! siteSlug ) {
		return null;
	}

	const taskDetails = getTask( { planName: 'Example Plan', siteSlug } );
	return (
		<Task
			isUrgent
			title={ taskDetails.heading }
			description={ taskDetails.body }
			timing={ 1 }
			taskId={ TASK_REACTIVATE_EXPIRED_PLAN }
			actionText={ taskDetails.buttonText }
			illustration={ taskDetails.illustration }
			actionUrl={ taskDetails.buttonLink }
		/>
	);
};
