import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import UnsubscribeCommentsButton from './unsubscribe-comments-button';

type CommentSettingsProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( { onUnsubscribe, unsubscribing }: CommentSettingsProps ) => (
	<SettingsPopover>
		<EmailMeNewCommentsToggle isUpdating={ false } />
		<Separator />
		<UnsubscribeCommentsButton unsubscribing={ unsubscribing } onUnsubscribe={ onUnsubscribe } />
	</SettingsPopover>
);

export default CommentSettings;
