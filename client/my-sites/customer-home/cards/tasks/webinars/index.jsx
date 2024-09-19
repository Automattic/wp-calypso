import { useTranslate } from 'i18n-calypso';
import webinarsIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';
import { TASK_WEBINARS } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const Webinars = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Learn from the pros' ) }
			description={ translate(
				'Free, live video webinars led by our experts teach you to build a website, start a blog, or make money with your site.'
			) }
			actionText={ translate( 'Register for free' ) }
			actionUrl="https://wordpress.com/webinars/"
			actionTarget="_blank"
			completeOnStart
			illustration={ webinarsIllustration }
			timing={ 2 }
			taskId={ TASK_WEBINARS }
		/>
	);
};

export default Webinars;
