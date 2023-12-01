import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { SubscriptionsEllipsisMenu } from '../../subscriptions-ellipsis-menu';
import { UnsubscribeIcon } from '../icons';

type CommentSettingsProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( { onUnsubscribe, unsubscribing }: CommentSettingsProps ) => {
	const translate = useTranslate();
	return (
		<SubscriptionsEllipsisMenu popoverClassName="comment-settings-popover">
			<Button
				className={ classNames( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
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
