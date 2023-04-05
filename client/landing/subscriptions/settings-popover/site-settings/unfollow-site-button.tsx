import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { UnfollowIcon } from '../icons';

type UnfollowSiteButtonProps = {
	onUnfollow: () => void;
	unfollowing: boolean;
};

const UnfollowSiteButton = ( { onUnfollow, unfollowing }: UnfollowSiteButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': unfollowing } ) }
			disabled={ unfollowing }
			icon={ <UnfollowIcon className="settings-popover__item-icon" /> }
			onClick={ onUnfollow }
		>
			{ translate( 'Unfollow' ) }
		</PopoverMenuItem>
	);
};

export default UnfollowSiteButton;
