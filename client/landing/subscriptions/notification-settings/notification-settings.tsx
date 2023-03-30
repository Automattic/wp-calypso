import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import './styles.scss';

const NotificationSettings = () => {
	return (
		<EllipsisMenu popoverClassName="notification-settings__popover">
			<PopoverMenuItem>Item</PopoverMenuItem>
		</EllipsisMenu>
	);
};

export default NotificationSettings;
