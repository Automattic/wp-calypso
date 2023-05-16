import { EmailDeliveryFrequency, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { SiteSettings } from 'calypso/landing/subscriptions/components/settings/site-settings/site-settings';

type SiteSubscriptionSettingsProps = {
	value: SettingsFormState;
	blogId: number | string;
};

type SettingsFormState = Partial< {
	notifyMeOfNewPosts: boolean;
	emailMeNewPosts: boolean;
	deliveryFrequency: EmailDeliveryFrequency;
	emailMeNewComments: boolean;
} >;

const DEFAULT_VALUE = {};

const SiteSubscriptionSettings = ( {
	blogId,
	value = DEFAULT_VALUE,
}: SiteSubscriptionSettingsProps ) => {
	const translate = useTranslate();

	const { mutate: updateNotifyMeOfNewPosts, isLoading: updatingNotifyMeOfNewPosts } =
		SubscriptionManager.useSiteNotifyMeOfNewPostsMutation();
	const { mutate: updateEmailMeNewPosts, isLoading: updatingEmailMeNewPosts } =
		SubscriptionManager.useSiteEmailMeNewPostsMutation();
	const { mutate: updateDeliveryFrequency, isLoading: updatingFrequency } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation();
	const { mutate: updateEmailMeNewComments, isLoading: updatingEmailMeNewComments } =
		SubscriptionManager.useSiteEmailMeNewCommentsMutation();

	return (
		<div className="site-subscription-settings">
			<h2 className="site-subscription-settings__heading">{ translate( 'Settings ' ) }</h2>
			<SiteSettings
				// NotifyMeOfNewPosts
				notifyMeOfNewPosts={ value.notifyMeOfNewPosts }
				onNotifyMeOfNewPostsChange={ ( send_posts ) =>
					updateNotifyMeOfNewPosts( { blog_id: blogId, send_posts } )
				}
				updatingNotifyMeOfNewPosts={ updatingNotifyMeOfNewPosts }
				// EmailMeNewPosts
				emailMeNewPosts={ value.emailMeNewPosts }
				onEmailMeNewPostsChange={ ( send_posts ) =>
					updateEmailMeNewPosts( { blog_id: blogId, send_posts } )
				}
				updatingEmailMeNewPosts={ updatingEmailMeNewPosts }
				// DeliveryFrequency
				deliveryFrequency={ value.deliveryFrequency }
				onDeliveryFrequencyChange={ ( delivery_frequency ) =>
					updateDeliveryFrequency( { blog_id: blogId, delivery_frequency } )
				}
				updatingFrequency={ updatingFrequency }
				// EmailMeNewComments
				emailMeNewComments={ value.emailMeNewComments }
				onEmailMeNewCommentsChange={ ( send_comments ) =>
					updateEmailMeNewComments( { blog_id: blogId, send_comments } )
				}
				updatingEmailMeNewComments={ updatingEmailMeNewComments }
			/>
		</div>
	);
};

export default SiteSubscriptionSettings;
