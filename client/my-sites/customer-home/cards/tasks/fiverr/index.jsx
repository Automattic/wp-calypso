import { useTranslate } from 'i18n-calypso';
import fiverrIllustration from 'calypso/assets/images/customer-home/illustration--task-fiverr.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_FIVERR } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const Fiverr = () => {
	const translate = useTranslate();
	return (
		<Task
			title={ translate( 'Grab a professionally designed logo in 10 minutes' ) }
			description={ preventWidows(
				translate(
					'A great logo signals competence, professionalism, and quality. For just $55, the Fiverr Logo Maker will improve your site’s look and reputation.'
				)
			) }
			actionText={ translate( 'Get your logo' ) }
			actionUrl="https://wp.me/logo-maker/?utm_campaign=my_home_task"
			illustration={ fiverrIllustration }
			timing={ 10 }
			taskId={ TASK_FIVERR }
		/>
	);
};

export default Fiverr;
