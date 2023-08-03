import announcementImage from 'calypso/assets/images/customer-home/notice-special-20-coupon.svg';
import { NOTICE_SPECIAL_20_COUPON } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const NoticeSpecial20Coupon = () => {
	const description = (
		<>
			Free domain for one year, plugins & themes, live chat support and more. Use <b>Special20</b>{ ' ' }
			at checkout. Coupon expires on <b>June 30th.</b>
		</>
	);

	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Task
			title="20% off all annual plans for 48 hours"
			description={ description }
			actionText="Check out our paid plans"
			actionUrl={ `https://wordpress.com/plans/${ siteSlug }` }
			illustration={ announcementImage }
			customClass="notice-offer-coupon"
			taskId={ NOTICE_SPECIAL_20_COUPON }
		/>
	);
};

export default NoticeSpecial20Coupon;
