import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { SiteSettings } from 'calypso/landing/subscriptions/components/settings';

type SiteSubscriptionSettingsProps = {
	notifyMeOfNewPosts: boolean;
	emailMeNewPosts: boolean;
	deliveryFrequency: Reader.EmailDeliveryFrequency;
	emailMeNewComments: boolean;
	blogId: string;
};

const SiteSubscriptionSettings = ( {
	blogId,
	notifyMeOfNewPosts,
	emailMeNewPosts,
	deliveryFrequency,
	emailMeNewComments,
}: SiteSubscriptionSettingsProps ) => {
	const translate = useTranslate();

	const { mutate: updateNotifyMeOfNewPosts, isLoading: updatingNotifyMeOfNewPosts } =
		SubscriptionManager.useSiteNotifyMeOfNewPostsMutation( blogId );
	const { mutate: updateEmailMeNewPosts, isLoading: updatingEmailMeNewPosts } =
		SubscriptionManager.useSiteEmailMeNewPostsMutation( blogId );
	const { mutate: updateDeliveryFrequency, isLoading: updatingFrequency } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation( blogId );
	const { mutate: updateEmailMeNewComments, isLoading: updatingEmailMeNewComments } =
		SubscriptionManager.useSiteEmailMeNewCommentsMutation( blogId );

	return (
		<div className="site-subscription-settings">
			<h2 className="site-subscription-settings__heading">{ translate( 'Settings' ) }</h2>
			<SiteSettings
				// NotifyMeOfNewPosts
				notifyMeOfNewPosts={ notifyMeOfNewPosts }
				onNotifyMeOfNewPostsChange={ ( send_posts ) =>
					updateNotifyMeOfNewPosts( { blog_id: blogId, send_posts } )
				}
				updatingNotifyMeOfNewPosts={ updatingNotifyMeOfNewPosts }
				// EmailMeNewPosts
				emailMeNewPosts={ emailMeNewPosts }
				onEmailMeNewPostsChange={ ( send_posts ) =>
					updateEmailMeNewPosts( { blog_id: blogId, send_posts } )
				}
				updatingEmailMeNewPosts={ updatingEmailMeNewPosts }
				// DeliveryFrequency
				deliveryFrequency={ deliveryFrequency }
				onDeliveryFrequencyChange={ ( delivery_frequency ) =>
					updateDeliveryFrequency( { blog_id: blogId, delivery_frequency } )
				}
				updatingFrequency={ updatingFrequency }
				// EmailMeNewComments
				emailMeNewComments={ emailMeNewComments }
				onEmailMeNewCommentsChange={ ( send_comments ) =>
					updateEmailMeNewComments( { blog_id: blogId, send_comments } )
				}
				updatingEmailMeNewComments={ updatingEmailMeNewComments }
			/>
		</div>
	);
};

export default SiteSubscriptionSettings;
