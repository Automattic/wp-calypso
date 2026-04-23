import { Icon, plus } from '@wordpress/icons';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';

interface SocialAddAccountMenuItemProps {
	label: string;
	href: string;
	icon?: React.ComponentProps< typeof Icon >[ 'icon' ];
	onClick?: () => void;
}

export function SocialAddAccountMenuItem( {
	label,
	href,
	icon = plus,
	onClick,
}: SocialAddAccountMenuItemProps ) {
	return (
		<MenuItem selected={ false } className="sidebar-social__add-account-item">
			<MenuItemLink className="sidebar__menu-link" href={ href } onClick={ onClick }>
				<Icon icon={ icon } size={ 22 } />
				<div className="sidebar__menu-item-title">{ label }</div>
			</MenuItemLink>
		</MenuItem>
	);
}
