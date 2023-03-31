import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { UnfollowIcon } from '../icons';

type UnfollowSiteButtonProps = {
	onUnfollow: () => void;
};

const UnfollowSiteButton = ( { onUnfollow }: UnfollowSiteButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className="settings-popover__item-button"
			icon={ <UnfollowIcon className="settings-popover__item-icon" /> }
			onClick={ onUnfollow }
		>
			{ translate( 'Unfollow' ) }
		</PopoverMenuItem>
	);
};

export default UnfollowSiteButton;
