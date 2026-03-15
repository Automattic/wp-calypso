import { Card, Gravatar } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export interface UserCardUser {
	displayName: string;
	email: string;
	avatarUrl?: string;
	username?: string;
	siteCount?: number;
}

export interface UserCardProps {
	user: UserCardUser;
	size?: 'small' | 'large';
	className?: string;
	/**
	 * Whether to display the site count alongside the username.
	 * Only applies to the small variant. Defaults to false.
	 */
	showSiteCount?: boolean;
}

/**
 * User card displaying avatar, name, and email/details
 * @example
 * <UserCard
 *   user={{
 *     displayName: "John Doe",
 *     email: "john@example.com",
 *     avatarUrl: "https://gravatar.com/avatar/...",
 *     username: "johndoe",
 *     siteCount: 3
 *   }}
 *   size="large"
 * />
 */
export function UserCard( {
	user,
	size = 'small',
	className,
	showSiteCount = false,
}: UserCardProps ): JSX.Element {
	const translate = useTranslate();
	const isLarge = size === 'large';
	const avatarSize = isLarge ? 64 : 48;

	// Convert our UserCardUser interface to the format Gravatar expects
	const gravatarUser = {
		display_name: user.displayName,
		avatar_URL: user.avatarUrl,
	};

	/**
	 * Get the secondary details to display below the user's name.
	 * For large (centered) variant: always show email.
	 * For small (horizontal) variant: show username + site count if showSiteCount is enabled
	 * and data is available, otherwise show email.
	 */
	const getUserDetails = () => {
		if ( isLarge ) {
			return user.email;
		}

		if ( showSiteCount && user.username && user.siteCount !== undefined ) {
			return translate( '%(username)s - %(count)d site', '%(username)s - %(count)d sites', {
				count: user.siteCount,
				args: {
					username: user.username,
					count: user.siteCount,
				},
			} );
		}

		return user.email;
	};

	return (
		<Card className={ clsx( 'connect-screen-user-card', `is-${ size }`, className ) }>
			<Gravatar user={ gravatarUser } size={ avatarSize } imgSize={ avatarSize * 2 } />
			<div className="connect-screen-user-card__info">
				<span className="connect-screen-user-card__name">{ user.displayName }</span>
				<span className="connect-screen-user-card__details">{ getUserDetails() }</span>
			</div>
		</Card>
	);
}
