import { useTranslate } from 'i18n-calypso';
import announcementImage from 'calypso/assets/images/marketplace/diamond.svg';
import { TASK_BUILT_BY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const BuiltBy = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Hire experts to build your website!' ) }
			description={ translate(
				'We’re here to help – whether you want to create an online store, redesign your website, migrate your site or simply want to showcase your work. Every site is unique, and has unique needs. So, to get started, let us know about your site’s needs: Click on the link below and tell us some details about your project or business.'
			) }
			actionText={ translate( 'Get Started' ) }
			actionUrl="https://builtbywp.com/?utm_medium=automattic_referred&utm_source=WordPresscom&utm_campaign=bb-card-home"
			illustration={ announcementImage }
			taskId={ TASK_BUILT_BY }
		/>
	);
};

export default BuiltBy;
