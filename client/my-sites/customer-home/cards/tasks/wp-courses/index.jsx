import coursesLogo from 'calypso/assets/images/customer-home/courses-logo.png';
import { TASK_WP_COURSES } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const WPCourses = () => {
	return (
		<Task
			title="World-class education by WordPress&nbsp;experts"
			description="Build your skills with access to webinars, courses, articles, support docs, a community and more! No enrollment required. No deadlines. Learn at your own pace."
			actionText="Get started here"
			actionUrl="https://wordpress.com/learn/?utm_source=wordpressdotcom&utm_medium=referral&utm_campaign=courses_launch_myhome"
			actionTarget="_blank"
			illustration={ coursesLogo }
			completeOnStart={ true }
			taskId={ TASK_WP_COURSES }
		/>
	);
};

export default WPCourses;
