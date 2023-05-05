import { SubscriptionManager } from '@automattic/data-stores';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import DeliveryFrequencyInput from './delivery-frequency-input';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import EmailMeNewPostsToggle from './email-me-new-posts-toggle';
import NotifyMeOfNewPostsToggle from './notify-me-of-new-posts-toggle';
import UnsubscribeSiteButton from './unsubscribe-site-button';
import type { SiteSubscriptionDeliveryFrequency } from '@automattic/data-stores/src/reader/types';

type SiteSettingsProps = {
	notifyMeOfNewPosts: boolean;
	onNotifyMeOfNewPostsChange: ( value: boolean ) => void;
	updatingNotifyMeOfNewPosts: boolean;
	emailMeNewPosts: boolean;
	onEmailMeNewPostsChange: ( value: boolean ) => void;
	updatingEmailMeNewPosts: boolean;
	deliveryFrequency: SiteSubscriptionDeliveryFrequency;
	onDeliveryFrequencyChange: ( value: SiteSubscriptionDeliveryFrequency ) => void;
	emailMeNewComments: boolean;
	onEmailMeNewCommentsChange: ( value: boolean ) => void;
	updatingEmailMeNewComments: boolean;
	onUnsubscribe: () => void;
	unsubscribing: boolean;
	updatingFrequency: boolean;
};

const SiteSettings = ( {
	notifyMeOfNewPosts,
	onNotifyMeOfNewPostsChange,
	updatingNotifyMeOfNewPosts,
	emailMeNewPosts,
	onEmailMeNewPostsChange,
	updatingEmailMeNewPosts,
	deliveryFrequency,
	onDeliveryFrequencyChange,
	emailMeNewComments,
	onEmailMeNewCommentsChange,
	updatingEmailMeNewComments,
	onUnsubscribe,
	unsubscribing,
	updatingFrequency,
}: SiteSettingsProps ) => {
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	return (
		<SettingsPopover>
			{ isLoggedIn && (
				<>
					<NotifyMeOfNewPostsToggle
						value={ notifyMeOfNewPosts }
						onChange={ onNotifyMeOfNewPostsChange }
						isUpdating={ updatingNotifyMeOfNewPosts }
					/>
					<EmailMeNewPostsToggle
						value={ emailMeNewPosts }
						onChange={ onEmailMeNewPostsChange }
						isUpdating={ updatingEmailMeNewPosts }
					/>
				</>
			) }
			{ emailMeNewPosts && (
				<DeliveryFrequencyInput
					value={ deliveryFrequency }
					onChange={ onDeliveryFrequencyChange }
					isUpdating={ updatingFrequency }
				/>
			) }
			{ isLoggedIn && (
				<EmailMeNewCommentsToggle
					value={ emailMeNewComments }
					onChange={ onEmailMeNewCommentsChange }
					isUpdating={ updatingEmailMeNewComments }
				/>
			) }
			<Separator />
			<UnsubscribeSiteButton unsubscribing={ unsubscribing } onUnsubscribe={ onUnsubscribe } />
		</SettingsPopover>
	);
};

export default SiteSettings;
