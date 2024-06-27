import { useTranslate } from 'i18n-calypso';
import affiliatesIllustration from 'calypso/assets/images/customer-home/illustration--affiliates-growth.png';
import { TASK_AFFILIATES } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const Affiliates = () => {
	const translate = useTranslate();

	const title = translate( 'Earn with the Automattic Affiliate Program' );
	const description = translate(
		'Get up to 100% payouts with Automattic’s suite of trusted, profitable brands, all with a single dashboard to manage and track your earnings across every product. Promote WordPress.com, WooCommerce, Jetpack, and more to your audience and turn conversions into earnings.'
	);

	return (
		<Task
			customClass="task__affiliate"
			title={ title }
			description={ description }
			actionText={ translate( 'Sign up' ) }
			actionUrl="https://automattic.com/affiliates/?ref=wordpressdotcom_task_home_card"
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ affiliatesIllustration }
			taskId={ TASK_AFFILIATES }
		/>
	);
};

export default Affiliates;
