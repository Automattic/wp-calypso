import { Card, Gravatar } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

export interface UserCardUser {
	displayName: string;
	email: string;
	avatarUrl?: string;
}

export interface UserCardProps {
	user: UserCardUser;
	size?: 'small' | 'large';
	className?: string;
}

/**
 * User card displaying avatar, name, and email
 * @example
 * <UserCard
 *   user={{
 *     displayName: "John Doe",
 *     email: "john@example.com",
 *     avatarUrl: "https://gravatar.com/avatar/..."
 *   }}
 *   size="large"
 * />
 */
export function UserCard( { user, size = 'small', className }: UserCardProps ): JSX.Element {
	const isLarge = size === 'large';
	const avatarSize = isLarge ? 64 : 48;

	// Convert our UserCardUser interface to the format Gravatar expects
	const gravatarUser = {
		display_name: user.displayName,
		avatar_URL: user.avatarUrl,
	};

	return (
		<Card className={ clsx( 'connect-screen-user-card', `is-${ size }`, className ) }>
			<Gravatar user={ gravatarUser } size={ avatarSize } imgSize={ avatarSize * 2 } />
			<div className="connect-screen-user-card__info">
				<span className="connect-screen-user-card__name">{ user.displayName }</span>
				<span className="connect-screen-user-card__email">{ user.email }</span>
			</div>
		</Card>
	);
}
