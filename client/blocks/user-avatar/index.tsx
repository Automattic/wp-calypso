import './style.scss';
import clsx from 'clsx';
import GravatarWithHovercards from 'calypso/components/gravatar-with-hovercards';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

const noop = () => undefined;

type UserAvatarProps = {
	className?: string;
	user?: UserAvatarInfo | null;
	isCompact?: boolean; // Show a small version of the avatar. Used in post cards and streams.
	onClick?: () => void; // Click handler to be executed when avatar is clicked.
	iconSize?: number | null;
};

type UserAvatarInfo = {
	ID?: number;
	avatar_URL?: string;
	display_name?: string;
	name?: string;
	login?: string;
	wpcom_login?: string;
};

export default function UserAvatar( {
	className,
	user,
	isCompact = false,
	onClick = noop,
	iconSize = null,
}: UserAvatarProps ) {
	// GravatarWithHovercards component display default avatar if user an empty object. Nothing when user is null or undefined.
	if ( ! user ) {
		user = {};
	}

	if ( ! iconSize ) {
		iconSize = isCompact ? 40 : 96;
	}

	const classes = clsx( 'user-avatar', 'has-gravatar', className, {
		'is-compact': isCompact,
	} );
	const avatarUrl = user?.wpcom_login ? getUserProfileUrl( user.wpcom_login ) : null;
	const userGravatar = <GravatarWithHovercards user={ user } size={ iconSize } />;
	const avatarElement = avatarUrl ? <a href={ avatarUrl }> { userGravatar }</a> : userGravatar;

	return (
		<div className={ classes } onClick={ onClick } aria-hidden="true">
			{ avatarElement }
		</div>
	);
}
