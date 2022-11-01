import announcementImage from 'calypso/assets/images/marketplace/built-by-wp-hori-blue.svg';
import { TASK_USE_BUILT_BY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const UseBuiltBy = () => {
	return (
		<Task
			title="Hire experts to build your website"
			description="Whether you want to create an online store, redesign your website, migrate your site or simply showcase your work — we are happy to help."
			actionText="Get Started"
			actionUrl="https://builtbywp.com/?utm_medium=automattic_referred&utm_source=WordPresscom&utm_campaign=bb-card-home"
			illustration={ announcementImage }
			taskId={ TASK_USE_BUILT_BY }
		/>
	);
};

export default UseBuiltBy;
