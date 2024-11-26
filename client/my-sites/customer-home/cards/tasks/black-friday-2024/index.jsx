import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import blackFriday2024Illustration from 'calypso/assets/images/customer-home/illustration--black-friday-2024.jpg';
import { TASK_BLACK_FRIDAY_2024 } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const BlackFriday2024 = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const title = translate( 'Our Biggest Sale of the Year' );
	const description = translate( 'For a limited time, we’re offering an unbeatable deal.' );

	return (
		<Task
			customClass="task__black-friday-2024"
			title={ title }
			description={ description }
			actionText={ translate( 'Get the Sale' ) }
			actionUrl={ `/plans/${ siteSlug }?coupon=` }
			completeOnStart={ false }
			illustration={ blackFriday2024Illustration }
			taskId={ TASK_BLACK_FRIDAY_2024 }
		/>
	);
};

export default BlackFriday2024;
