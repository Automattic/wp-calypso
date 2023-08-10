import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { SubscriptionsEllipsisMenu } from '../../subscriptions-ellipsis-menu';
import { UnsubscribeIcon } from '../icons';
import DeliveryFrequencyInput from './delivery-frequency-input';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import EmailMeNewPostsToggle from './email-me-new-posts-toggle';
import NotifyMeOfNewPostsToggle from './notify-me-of-new-posts-toggle';
import './styles.scss';
import '../styles.scss';

type SiteSettingsProps = {
	notifyMeOfNewPosts: boolean;
	onNotifyMeOfNewPostsChange: ( value: boolean ) => void;
	updatingNotifyMeOfNewPosts: boolean;
	emailMeNewPosts: boolean;
	onEmailMeNewPostsChange: ( value: boolean ) => void;
	updatingEmailMeNewPosts: boolean;
	deliveryFrequency: Reader.EmailDeliveryFrequency;
	onDeliveryFrequencyChange: ( value: Reader.EmailDeliveryFrequency ) => void;
	updatingFrequency: boolean;
	emailMeNewComments: boolean;
	onEmailMeNewCommentsChange: ( value: boolean ) => void;
	updatingEmailMeNewComments: boolean;
	isWpComSite?: boolean;
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
	updatingFrequency,
}: SiteSettingsProps ) => {
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	return (
		<div className="settings site-settings">
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
	isWpComSite = true,
	...props
}: SiteSettingsPopoverProps ) => {
	const translate = useTranslate();
	return (
		<SubscriptionsEllipsisMenu popoverClassName="site-settings-popover">
			{ ( close: () => void ) => (
				<>
					{ isWpComSite && (
						<>
							<SiteSettings { ...props } />
							<hr className="subscriptions__separator" />
						</>
					) }

					<Button
						className={ classNames( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
						disabled={ unsubscribing }
						icon={ <UnsubscribeIcon className="subscriptions-ellipsis-menu__item-icon" /> }
						onClick={ () => {
							onUnsubscribe();
							close();
						} }
					>
						{ translate( 'Unsubscribe' ) }
					</Button>
				</>
			) }
		</SubscriptionsEllipsisMenu>
	);
};

export default SiteSettings;
