import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import affiliatesIllustration from 'calypso/assets/images/customer-home/illustration--affiliates-growth.png';
import { TASK_AFFILIATES } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const Affiliates = () => {
	const translate = useTranslate();
	const hasTranslation = useHasEnTranslation();

	const title = translate( 'Earn with the Automattic Affiliate Program' );
	const hasTitleTranaslation = hasTranslation( title );

	const description = translate(
		'Get up to 100% payouts with Automattic’s suite of trusted, profitable brands, all with a single dashboard to manage and track your earnings across every product. Promote WordPress.com, WooCommerce, Jetpack, and more to your audience and turn conversions into earnings.'
	);

	const hasDescriptionTranslations = hasTranslation( description );

	if ( ! hasTitleTranaslation || ! hasDescriptionTranslations ) {
		Affiliates.isDisabled = true;
		return null;
	}
	return (
		<Task
			customClass="task__affiliate"
			title={ title }
			description={ description }
			actionText={ translate( 'Sign up' ) }
			actionUrl="https://app.impact.com/campaign-campaign-info-v2/Automattic-Inc.brand?ref=wordpressdotcom"
			completeOnStart={ false }
			illustration={ affiliatesIllustration }
			taskId={ TASK_AFFILIATES }
		/>
	);
};

export default Affiliates;
