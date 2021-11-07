import { useTranslate } from 'i18n-calypso';
import growthSummitIllustration from 'calypso/assets/images/customer-home/illustration--growth-summit.png';
import { TASK_GROWTH_SUMMIT } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const GrowthSummit = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'The WordPress.com Growth Summit' ) }
			description={ translate(
				'Join us online August 17 (Americas + EMEA) + August 18 (Asia Pacific) to get expert advice on how to grow your audience and earn money.'
			) }
			actionText={ translate( 'Register today for $25 USD!' ) }
			actionUrl="https://wordpress.com/growth-summit/?utm_source=my_home&utm_medium=organic_social_media&utm_campaign=myhome&flags=a8c-analytics.on,ad-tracking,google-analytics&ga_optimize=on"
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ growthSummitIllustration }
			taskId={ TASK_GROWTH_SUMMIT }
		/>
	);
};

export default GrowthSummit;
