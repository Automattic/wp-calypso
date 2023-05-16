import { SubscriptionManager, EmailDeliveryFrequency } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { UnsubscribeIcon } from '../icons';
import SettingsPopover from '../settings-popover/settings-popover';
import DeliveryFrequencyInput from './delivery-frequency-input';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import EmailMeNewPostsToggle from './email-me-new-posts-toggle';
import NotifyMeOfNewPostsToggle from './notify-me-of-new-posts-toggle';
import './styles.scss';
import '../styles.scss';

export type SiteSettingsProps = {
	notifyMeOfNewPosts?: boolean;
	onNotifyMeOfNewPostsChange: ( value: boolean ) => void;
	updatingNotifyMeOfNewPosts: boolean;
	emailMeNewPosts?: boolean;
	onEmailMeNewPostsChange: ( value: boolean ) => void;
	updatingEmailMeNewPosts: boolean;
	deliveryFrequency?: EmailDeliveryFrequency;
	onDeliveryFrequencyChange: ( value: EmailDeliveryFrequency ) => void;
	updatingFrequency: boolean;
	emailMeNewComments?: boolean;
	onEmailMeNewCommentsChange: ( value: boolean ) => void;
	updatingEmailMeNewComments: boolean;
};

export const SiteSettings = ( {
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
	updatingFrequency,
}: SiteSettingsProps ) => {
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	return (
		<div className="settings site-settings">
			{ isLoggedIn && (
				<>
					<NotifyMeOfNewPostsToggle
						value={ notifyMeOfNewPosts ?? false }
						onChange={ onNotifyMeOfNewPostsChange }
						isUpdating={ updatingNotifyMeOfNewPosts }
					/>
					<EmailMeNewPostsToggle
						value={ emailMeNewPosts ?? false }
						onChange={ onEmailMeNewPostsChange }
						isUpdating={ updatingEmailMeNewPosts }
					/>
				</>
			) }
			{ emailMeNewPosts && (
				<DeliveryFrequencyInput
					value={ deliveryFrequency ?? EmailDeliveryFrequency.Daily }
					onChange={ onDeliveryFrequencyChange }
					isUpdating={ updatingFrequency }
				/>
			) }
			{ isLoggedIn && (
				<EmailMeNewCommentsToggle
					value={ emailMeNewComments ?? false }
					onChange={ onEmailMeNewCommentsChange }
					isUpdating={ updatingEmailMeNewComments }
				/>
			) }
		</div>
	);
};

type SiteSettingsPopoverProps = SiteSettingsProps & {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

export const SiteSettingsPopover = ( {
	onUnsubscribe,
	unsubscribing,
	...props
}: SiteSettingsPopoverProps ) => {
	const translate = useTranslate();
	return (
		<SettingsPopover className="site-settings-popover">
			<SiteSettings { ...props } />

			<hr className="subscriptions__separator" />

			<Button
				className={ classNames( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
				disabled={ unsubscribing }
				icon={ <UnsubscribeIcon className="settings-popover__item-icon" /> }
				onClick={ onUnsubscribe }
			>
				{ translate( 'Unsubscribe' ) }
			</Button>
		</SettingsPopover>
	);
};

export default SiteSettings;
