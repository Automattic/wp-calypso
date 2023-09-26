import { SubscriptionManager } from '@automattic/data-stores';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRecordCommentEmailsToggle } from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';

const EmailMeNewCommentsToggle = () => {
	const { data: subscription } = useSiteSubscription();

	const translate = useTranslate();
	const emailMeNewComments = Boolean( subscription?.deliveryMethods.email?.sendComments );

	const { mutate: updateEmailMeNewComments, isLoading } =
		SubscriptionManager.useSiteEmailMeNewCommentsMutation();
	const recordCommentEmailsToggle = useRecordCommentEmailsToggle();

	const toggleValue = () => {
		if ( subscription === undefined || subscription.blogId === undefined ) {
			return;
		}

		const newValue = ! emailMeNewComments;

		// Update comment emails settings
		updateEmailMeNewComments( {
			blog_id: subscription.blogId,
			send_comments: newValue,
			subscriptionId: Number( subscription.id ),
		} );

		// Record tracks event
		recordCommentEmailsToggle( newValue, { blog_id: subscription.blogId } );
	};

	return (
		<div className="setting-item setting-item__last email-me-new-comments-toggle">
			<ToggleControl
				label={ translate( 'Email me new comments' ) }
				onChange={ toggleValue }
				checked={ emailMeNewComments }
				disabled={ isLoading }
			/>
		</div>
	);
};

export default EmailMeNewCommentsToggle;
