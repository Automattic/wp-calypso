import { useTranslate } from 'i18n-calypso';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import { ToggleInput } from '../toggle-input';
import UnfollowCommentsButton from './unfollow-comments-button';

type CommentSettingsProps = {
	onChangeSendCommentsByEmail: ( sendCommentsByEmail: boolean ) => void;
	onChangeSendCommentsByNotification: ( sendCommentsByNotification: boolean ) => void;
	onUnfollow: () => void;
	sendCommentsByEmail: boolean;
	sendCommentsByNotification: boolean;
	unfollowing: boolean;
	updatingSendCommentsByEmail: boolean;
	updatingSendCommentsByNotification: boolean;
};

const CommentSettings = ( {
	onChangeSendCommentsByEmail,
	onChangeSendCommentsByNotification,
	onUnfollow,
	sendCommentsByEmail,
	sendCommentsByNotification,
	unfollowing,
	updatingSendCommentsByEmail,
	updatingSendCommentsByNotification,
}: CommentSettingsProps ) => {
	const translate = useTranslate();

	return (
		<SettingsPopover>
			<ToggleInput
				checked={ sendCommentsByNotification }
				onChange={ onChangeSendCommentsByNotification }
				label={ translate( 'Notify me of new comments' ) }
				hint={ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
				loading={ updatingSendCommentsByNotification }
			/>
			<ToggleInput
				checked={ sendCommentsByEmail }
				onChange={ onChangeSendCommentsByEmail }
				label={ translate( 'Email me new comments' ) }
				loading={ updatingSendCommentsByEmail }
			/>
			<Separator />
			<UnfollowCommentsButton unfollowing={ unfollowing } onUnfollow={ onUnfollow } />
		</SettingsPopover>
	);
};

export default CommentSettings;
