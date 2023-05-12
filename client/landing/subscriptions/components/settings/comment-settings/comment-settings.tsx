import { SettingsPopover } from '../settings-popover';
import UnsubscribeCommentsButton from './unsubscribe-comments-button';

type CommentSettingsProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( { onUnsubscribe, unsubscribing }: CommentSettingsProps ) => (
	<SettingsPopover>
		<UnsubscribeCommentsButton unsubscribing={ unsubscribing } onUnsubscribe={ onUnsubscribe } />
	</SettingsPopover>
);

export default CommentSettings;
