import { useTranslate } from 'i18n-calypso';
import builderReferral from 'calypso/assets/images/illustrations/builder-referral.svg';
import { TASK_DIFM_LITE_IN_PROGRESS } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const DIFMLiteInProgress = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Hang on! Our experts are building your site.' ) }
			description={ translate(
				'Our Built By WordPress.com team will be in touch with you when your site is ready to be transferred to your account and launched.'
			) }
			illustration={ builderReferral }
			taskId={ TASK_DIFM_LITE_IN_PROGRESS }
			showSkip={ false }
			hasAction={ false }
		/>
	);
};

export default DIFMLiteInProgress;
