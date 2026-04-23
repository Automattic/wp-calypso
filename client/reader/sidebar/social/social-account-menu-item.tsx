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
		<MenuItem selected={ isSelected } className="sidebar-social__account-item">
			<MenuItemLink className="sidebar__menu-link" href={ href } onClick={ onClick }>
				{ avatarUrl ? (
					// Render a raw <img> instead of <SiteIcon>: ATProto/Bluesky avatars are
					// already CDN-hosted at appropriate sizes, and SiteIcon routes the URL
					// through Photon, which doesn't work for non-WordPress.com hosts.
					<img
						className="sidebar-social__account-avatar"
						src={ avatarUrl }
						alt=""
						width={ 22 }
						height={ 22 }
						loading="lazy"
						decoding="async"
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
