import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { UnfollowIcon } from '../icons';

type UnfollowCommentsButtonProps = {
	onUnfollow: () => void;
	unfollowing: boolean;
};

const UnfollowCommentsButton = ( { onUnfollow, unfollowing }: UnfollowCommentsButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': unfollowing } ) }
			disabled={ unfollowing }
			icon={ <UnfollowIcon className="settings-popover__item-icon" /> }
			onClick={ onUnfollow }
		>
			{ translate( 'Unfollow comments' ) }
		</PopoverMenuItem>
	);
};

export default UnfollowCommentsButton;
