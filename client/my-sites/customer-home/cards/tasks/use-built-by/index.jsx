import { WordPressLogo } from '@automattic/components';
import { TASK_USE_BUILT_BY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

const UseBuiltBy = () => {
	return (
		<Task
			title="Get expert help for your website"
			description="Whether you want to create an online store, redesign your website, migrate your site or simply showcase your work — we are happy to help."
			actionText="Get Started"
			actionUrl="https://wordpress.com/website-design-service/?ref=my-home-card"
			illustration={ <WordPressLogo size={ 96 } className="use-built-by__logo" /> }
			taskId={ TASK_USE_BUILT_BY }
		/>
	);
};

export default UseBuiltBy;
