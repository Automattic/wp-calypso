import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import sellerIllustration from 'calypso/assets/images/customer-home/illustration--seller.svg';
import { NOTICE_SITE_LAUNCH_SELLER_UPSELL } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteLaunchSellerUpsell = () => {
	const selectedSite = useSelector( getSelectedSite );
	const { domain } = selectedSite;
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Need more from your store?' ) }
			description={ translate(
				'Upgrade to our premium plan to gain access to all the tools you need to run an online ecommerce store, from marketing to shipping.'
			) }
			actionText={ translate( 'Learn more' ) }
			actionUrl={ `https://wordpress.com/woocommerce-installation/${ domain }` }
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ sellerIllustration }
			taskId={ NOTICE_SITE_LAUNCH_SELLER_UPSELL }
		/>
	);
};

export default SiteLaunchSellerUpsell;
