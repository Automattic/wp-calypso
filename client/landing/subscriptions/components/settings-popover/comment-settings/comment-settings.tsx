import SettingsPopover from '../settings-popover';
import UnfollowCommentsButton from './unfollow-comments-button';

type CommentSettingsProps = {
	onUnfollow: () => void;
	unfollowing: boolean;
};

const CommentSettings = ( { onUnfollow, unfollowing }: CommentSettingsProps ) => (
	<SettingsPopover>
		<UnfollowCommentsButton unfollowing={ unfollowing } onUnfollow={ onUnfollow } />
	</SettingsPopover>
);

export default CommentSettings;
