import { SubscriptionManager } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { SubscriptionsEllipsisMenu } from '../../subscriptions-ellipsis-menu';
import UnsubscribeIcon from '../icons/unsubscribe-icon';
import NotifyMeOfNewCommentsToggle from './notify-me-of-new-comments-toggle';
import '../styles.scss';

type CommentSettingsProps = {
	notifyMeOfNewComments: boolean;
	onNotifyMeOfNewCommentsChange: ( value: boolean ) => void;
	updatingNotifyMeOfNewComments: boolean;
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( {
	notifyMeOfNewComments,
	onNotifyMeOfNewCommentsChange,
	updatingNotifyMeOfNewComments,
	onUnsubscribe,
	unsubscribing,
}: CommentSettingsProps ) => {
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	return (
		<SubscriptionsEllipsisMenu popoverClassName="comment-settings-popover">
			{ isLoggedIn && (
				<div className="settings site-settings">
					<NotifyMeOfNewCommentsToggle
						value={ notifyMeOfNewComments }
						onChange={ onNotifyMeOfNewCommentsChange }
						isUpdating={ updatingNotifyMeOfNewComments }
					/>
				</div>
			) }

			<hr className="subscriptions__separator" />

			<Button
				className={ clsx( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
				disabled={ unsubscribing }
				icon={ <UnsubscribeIcon className="subscriptions-ellipsis-menu__item-icon" /> }
				onClick={ onUnsubscribe }
			>
				{ translate( 'Unsubscribe comments' ) }
			</Button>
		</SubscriptionsEllipsisMenu>
	);
};

export default CommentSettings;
