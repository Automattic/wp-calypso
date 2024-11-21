import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import blackFriday2024Illustration from 'calypso/assets/images/customer-home/illustration--black-friday-2024.jpg';
import { TASK_BLACK_FRIDAY_2024 } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

const Affiliates = () => {
	const translate = useTranslate();

	const title = translate( 'The Biggest Sale of the Year' );
	const description = translate( 'For a limited time, we’re offering an unbeatable deal.' );

	return (
		<Task
			customClass="task__black-friday-2024"
			title={ title }
			description={ description }
			actionText={ translate( 'Get the Sale' ) }
			actionUrl={ localizeUrl( 'https://wordpress.com/pricing/black-friday-2024' ) }
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ blackFriday2024Illustration }
			taskId={ TASK_BLACK_FRIDAY_2024 }
		/>
	);
};

export default Affiliates;
