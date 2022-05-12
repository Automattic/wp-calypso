import { useTranslate } from 'i18n-calypso';
import sellerIllustration from 'calypso/assets/images/customer-home/illustration--seller.svg';
import { NOTICE_PLAN_ANNOUNCEMENT } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const PlanAnnouncement = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Announcing a new plan: WordPress.com Starter' ) }
			description={ translate(
				'Every site starts with an idea. WordPress Starter is a new, beautifully pared-back plan designed to put that idea center stage. For just $5/month.'
			) }
			actionText={ translate( 'Learn more' ) }
			actionUrl={ `LINKTOANNOUNCEMENT` }
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ sellerIllustration }
			taskId={ NOTICE_PLAN_ANNOUNCEMENT }
		/>
	);
};

export default PlanAnnouncement;
