import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import UnfollowSiteButton from './unfollow-site-button';

type SiteSettingsProps = {
	onUnfollow: () => void;
};

const SiteSettings = ( { onUnfollow }: SiteSettingsProps ) => (
	<SettingsPopover>
		<PopoverMenuItem itemComponent="div">Delivery Frequency Placeholder</PopoverMenuItem>
		<Separator />
		<UnfollowSiteButton onUnfollow={ onUnfollow } />
	</SettingsPopover>
);

export default SiteSettings;
