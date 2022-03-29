import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import sellerIllustration from 'calypso/assets/images/customer-home/illustration--seller.svg';
import { NOTICE_SITE_LAUNCH_SELLER_UPSELL } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteLaunchSellerUpsell = () => {
	const selectedSite = useSelector( getSelectedSite );
	const { domain } = selectedSite;
	const translate = useTranslate();
	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite.ID )
	);

	return (
		<Task
			title={ translate( 'Need more from your store?' ) }
			description={
				eligibleForProPlan
					? translate(
							'Upgrade to our Pro plan to gain access to all the tools you need to run an online ecommerce store, from marketing to shipping.'
					  )
					: translate(
							'Upgrade to our premium plan to gain access to all the tools you need to run an online ecommerce store, from marketing to shipping.'
					  )
			}
			actionText={ translate( 'Learn more' ) }
			actionUrl={ `http://wordpress.com/woocommerce-installation/${ domain }` }
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ sellerIllustration }
			taskId={ NOTICE_SITE_LAUNCH_SELLER_UPSELL }
		/>
	);
};

export default SiteLaunchSellerUpsell;
