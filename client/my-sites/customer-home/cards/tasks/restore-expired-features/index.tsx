import { translate } from 'i18n-calypso';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import { TASK_REVERTED_SITE_NOW_ATOMIC } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

export const RevertedSiteIsNowAtomic = () => {
	return (
		<Task
			isUrgent
			title={ translate( 'The Heading' ) }
			description={ translate( 'The Body' ) }
			timing={ 1 }
			taskId={ TASK_REVERTED_SITE_NOW_ATOMIC }
			actionText={ translate( 'What should my content be?' ) }
			illustration={ expiredIllustration }
			actionUrl="https://docs.google.com/document/d/125M0PJ7O4qkIxSyg-paC5Xm1DXAd3CyK57utL7YfPs8/edit#heading=h.65gix4k0kof"
		/>
	);
};
