import './styles.scss';
import page from '@automattic/calypso-router';
import { Popover } from '@wordpress/components';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import UserHovercard from 'calypso/blocks/user-avatar/user-hovercard';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { useGetReaderUserQuery } from 'calypso/reader/user-profile/queries/useGetReaderUserQuery';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import { getProcessedGravatarUrl } from './utils';

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
	profile_URL?: string;
	wpcom_id?: number;
	wpcom_login?: string;
}

export default function UserAvatar( {
	className,
	user,
	size = 32,
	hideHovercard = false,
}: UserAvatarProps ) {
	const [ isHovered, setIsHovered ] = useState( false );
	const avatarRef = useRef< HTMLDivElement >( null );
	const classes = clsx( 'user-avatar', className );
	const wpcomProfileUrl = user?.wpcom_login ? getUserProfileUrl( user?.wpcom_login ) : null;
	const name = user?.display_name || user?.name || '';
	const avatarUrl = user?.avatar_URL ? getProcessedGravatarUrl( user.avatar_URL ) : null;
	const avatarImg = avatarUrl ? (
		<img
			className="user-avatar__image"
			src={ avatarUrl }
			alt={ name }
			width={ size }
			height={ size }
			style={ { maxWidth: size, height: size } } // Override global styles. Always render avatar at the specified size.
		/>
	) : (
		<UserAvatarDefaultIcon iconSize={ size } />
	);

	// Prefetching so that we can display WPCOM Hovercards instantly, Gravatar lookups will be triggered on hover.
	useGetReaderUserQuery( user?.wpcom_login, user?.wpcom_id );

	return (
		<div
			ref={ avatarRef }
			className={ classes }
			aria-hidden="true"
			onClick={ ( event ) => {
				event.preventDefault();
				event.stopPropagation();
			} }
			onMouseEnter={ () => setIsHovered( true ) }
			onMouseLeave={ () => setIsHovered( false ) }
		>
			{ wpcomProfileUrl ? (
				<a href={ wpcomProfileUrl } onClick={ () => page( wpcomProfileUrl ) }>
					{ avatarImg }
				</a>
			) : (
				avatarImg
			) }

			{ user && ! hideHovercard && isHovered && (
				<Popover
					anchor={ avatarRef.current }
					variant="unstyled"
					placement="bottom"
					focusOnMount={ false }
					noArrow
				>
					<UserHovercard user={ user } size={ size } />
				</Popover>
			) }
		</div>
	);
}
