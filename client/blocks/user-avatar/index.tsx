import clsx from 'clsx';
import GravatarWithHovercards from 'calypso/components/gravatar-with-hovercards';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

const noop = () => undefined;

type UserAvatarProps = {
	className?: string;
	user?: UserAvatarInfo | null;
	size?: number;
	onClick?: () => void; // Click handler to be executed when avatar is clicked.
};

type UserAvatarInfo = {
	ID?: number; // Represents user ID on source website i.e. WPCOM, Jetpack site, etc.
	avatar_URL?: string;
	display_name?: string;
	name?: string;
	login?: string; // Represents username on source website i.e. WPCOM, Jetpack site, etc.
	wpcom_id?: number;
	wpcom_login?: string;
};

export default function UserAvatar( {
	className,
	user,
	size = 32,
	onClick = noop,
}: UserAvatarProps ) {
	// GravatarWithHovercards component display default avatar if user an empty object. Nothing when user is null or undefined.
	if ( ! user ) {
		user = {};
	}

	const classes = clsx( 'user-avatar', 'has-gravatar', className );
	const userProfileUrl = user?.wpcom_login ? getUserProfileUrl( user?.wpcom_login ) : null;
	const userGravatar = <GravatarWithHovercards user={ user } size={ size } />;
	const avatarElement = userProfileUrl ? (
		<a href={ userProfileUrl }> { userGravatar }</a>
	) : (
		userGravatar
	);

	return (
		<div className={ classes } onClick={ onClick } aria-hidden="true">
			{ avatarElement }
		</div>
	);
}
