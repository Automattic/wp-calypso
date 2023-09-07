import announcementImage from 'calypso/assets/images/marketplace/notice-offer-coupon.svg';
import { NOTICE_OFFER_COUPON } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const NoticeOfferCoupon = () => {
	return (
		<Task
			title="20% off all annual plans for 48 hours"
			description="Free domain for one year, plugins & themes, live chat support and more. Use <b>Special20<b> at checkout. Coupon expires on <b>June 30th.</b>"
			actionText="Check out our paid plans"
			actionUrl="https://wordpress.com/website-design-service/?ref=my-home-card"
			illustration={ announcementImage }
			taskId={ NOTICE_OFFER_COUPON }
		/>
	);
};

export default NoticeOfferCoupon;
