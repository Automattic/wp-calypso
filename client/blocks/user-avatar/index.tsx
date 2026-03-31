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
	ID?: number;
	avatar_URL?: string;
	display_name?: string;
	name?: string;
	login?: string; // Some API's send the username as "login" instead of "wpcom_login". This is to support both cases.
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
	const username = user?.wpcom_login || user?.login;
	const userProfileUrl = username ? getUserProfileUrl( username ) : null;
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
