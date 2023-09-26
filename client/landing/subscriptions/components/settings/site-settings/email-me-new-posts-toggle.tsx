import { SubscriptionManager } from '@automattic/data-stores';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRecordPostEmailsToggle } from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';

const EmailMeNewPostsToggle = () => {
	const { data: subscription } = useSiteSubscription();
	const emailMeNewPosts = Boolean( subscription?.deliveryMethods.email?.sendPosts );
	const translate = useTranslate();
	const recordPostEmailsToggle = useRecordPostEmailsToggle();

	const { mutate: updateEmailMeNewPosts, isLoading: isUpdating } =
		SubscriptionManager.useSiteEmailMeNewPostsMutation();

	const toggleValue = () => {
		if ( subscription === undefined || subscription.blogId === undefined ) {
			return;
		}

		const newValue = ! emailMeNewPosts;

		// Update post emails settings
		updateEmailMeNewPosts( {
			blogId: subscription.blogId,
			sendPosts: newValue,
			subscriptionId: Number( subscription.id ),
		} );

		// Record tracks event
		recordPostEmailsToggle( newValue, { blog_id: String( subscription.id ) } );
	};

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Email me new posts' ) }
				onChange={ toggleValue }
				checked={ emailMeNewPosts }
				disabled={ isUpdating }
			/>
		</div>
	);
};

export default EmailMeNewPostsToggle;
