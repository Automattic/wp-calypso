import { useTranslate } from 'i18n-calypso';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import { ToggleInput } from '../toggle-input';
import UnfollowCommentsButton from './unfollow-comments-button';

type CommentSettingsProps = {
	onChangeSendByEmail: ( sendByEmail: boolean ) => void;
	onUnfollow: () => void;
	shouldSendByEmail: boolean;
	unfollowing: boolean;
	updatingSendByEmail: boolean;
};

const CommentSettings = ( {
	onChangeSendByEmail,
	onUnfollow,
	shouldSendByEmail,
	unfollowing,
	updatingSendByEmail,
}: CommentSettingsProps ) => {
	const translate = useTranslate();

	return (
		<SettingsPopover>
			<ToggleInput
				checked={ shouldSendByEmail }
				onChange={ onChangeSendByEmail }
				label={ translate( 'Email me new comments' ) }
				loading={ updatingSendByEmail }
			/>
			<Separator />
			<UnfollowCommentsButton unfollowing={ unfollowing } onUnfollow={ onUnfollow } />
		</SettingsPopover>
	);
};

export default CommentSettings;
