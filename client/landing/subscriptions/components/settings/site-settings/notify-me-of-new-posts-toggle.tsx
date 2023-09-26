import { SubscriptionManager } from '@automattic/data-stores';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRecordNotificationsToggle } from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';

const NotifyMeOfNewPostsToggle = () => {
	const translate = useTranslate();

	const { data: subscription } = useSiteSubscription();
	if ( subscription === undefined ) {
		throw new Error( 'NotifyMeOfNewPostsToggle: site subscription data is undefined' );
	}

	const value = Boolean( subscription.deliveryMethods.notification?.sendPosts );

	const { mutate: updateNotifyMeOfNewPosts, isLoading } =
		SubscriptionManager.useSiteNotifyMeOfNewPostsMutation();
	const recordNotificationsToggle = useRecordNotificationsToggle();

	const toggleValue = () => {
		const newValue = ! value;
		// Update post notification settings
		updateNotifyMeOfNewPosts( {
			blog_id: subscription.blogId,
			send_posts: newValue,
			subscriptionId: Number( subscription.id ),
		} );

		// Record tracks event
		recordNotificationsToggle( newValue, { blog_id: subscription.blogId } );
	};

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Notify me of new posts' ) }
				onChange={ () => toggleValue() }
				checked={ value }
				disabled={ isLoading }
			/>
			<p className="setting-item__hint">
				{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
			</p>
		</div>
	);
};

export default NotifyMeOfNewPostsToggle;
