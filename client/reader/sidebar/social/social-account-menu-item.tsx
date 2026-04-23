import clsx from 'clsx';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';

interface SocialAccountMenuItemProps {
	avatarUrl: string | null;
	displayName: string;
	handle: string;
	href: string;
	isSelected: boolean;
	onClick?: () => void;
}

export function SocialAccountMenuItem( {
	avatarUrl,
	displayName,
	handle,
	href,
	isSelected,
	onClick,
}: SocialAccountMenuItemProps ) {
	return (
		<MenuItem
			selected={ isSelected }
			className={ clsx( 'sidebar-social__account-item', { 'is-selected': isSelected } ) }
		>
			<MenuItemLink className="sidebar__menu-link" href={ href } onClick={ onClick }>
				{ avatarUrl ? (
					<img
						className="sidebar-social__account-avatar"
						src={ avatarUrl }
						alt={ displayName }
						width={ 22 }
						height={ 22 }
					/>
				) : (
					<SiteIcon iconUrl={ null } size={ 22 } />
				) }
				<div className="sidebar-social__account-text">
					<div className="sidebar__menu-item-title">{ displayName }</div>
					<div className="sidebar-social__account-handle">{ handle }</div>
				</div>
			</MenuItemLink>
		</MenuItem>
	);
}
