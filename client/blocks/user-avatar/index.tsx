import './styles.scss';
import clsx from 'clsx';
import UserHovercard from 'calypso/blocks/user-avatar/user-hovercard';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

const noop = () => undefined;

type UserAvatarProps = {
	className?: string;
	user?: UserAvatarInfo | null;
	size?: number;
	hideHovercard?: boolean;
	onClose?: () => void; // Click handler to be executed when avatar is clicked.
};

export interface UserAvatarInfo {
	ID?: number; // Represents user ID on source website i.e. WPCOM, Jetpack site, etc.
	avatar_URL?: string;
	display_name?: string;
	name?: string;
	description?: string;
	site_ID?: number;
	login?: string; // Represents username on source website i.e. WPCOM, Jetpack site, etc.
	wpcom_id?: number;
	wpcom_login?: string;
}

export default function UserAvatar( {
	className,
	user,
	size = 32,
	hideHovercard = false,
}: UserAvatarProps ) {
	const classes = clsx( 'user-avatar', className );
	const wpcomProfileUrl = user?.wpcom_login ? getUserProfileUrl( user?.wpcom_login ) : null;
	const name = user?.display_name || user?.name || '';
	const avatarImg = user?.avatar_URL ? (
		<img
			className="user-avatar__image"
			src={ user.avatar_URL }
			alt={ name }
			width={ size }
			height={ size }
			style={ { maxWidth: size, height: size } } // Override global styles. Always render avatar at the specified size.
		/>
	) : (
		<UserAvatarDefaultIcon iconSize={ size } />
	);

	return (
		<div className={ classes } onClick={ noop } aria-hidden="true">
			{ wpcomProfileUrl ? <a href={ wpcomProfileUrl }> { avatarImg }</a> : avatarImg }
			{ user && ! hideHovercard && <UserHovercard user={ user } size={ size } /> }
		</div>
	);
}
