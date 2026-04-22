import './style.scss';

import { userQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Popover } from '@wordpress/components';
import { useCallback, useRef, useState } from 'react';
import UserHovercard from 'calypso/blocks/user-avatar/user-hovercard';
import PreloadedImage from 'calypso/components/preloaded-image';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import { getProcessedGravatarUrl } from './utils';

type UserAvatarProps = {
	user?: UserAvatarInfo | null;
	size?: number;
	hideHovercard?: boolean;
};

export interface UserAvatarInfo {
	ID?: number; // Represents user ID on source website i.e. WPCOM, Jetpack site, etc.
	avatar_URL?: string;
	display_name?: string;
	name?: string;
	description?: string;
	login?: string; // Represents username on source website i.e. WPCOM, Jetpack site, etc.
	profile_URL?: string;
	wpcom_id?: number;
	wpcom_login?: string;
}

export default function UserAvatar( { user, size = 32, hideHovercard = false }: UserAvatarProps ) {
	const [ isHovered, setIsHovered ] = useState( false );
	const avatarRef = useRef< HTMLDivElement >( null );
	// Using this to add a delay before showing the hovercard, to avoid it flashing when the user is just moving their mouse across the avatar.
	const hoverTimerRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const wpcomProfileUrl = user?.wpcom_login ? getUserProfileUrl( user?.wpcom_login ) : null; // Only navigate to profile page. Avoid navigating to any external links to keep UX consistent.
	const name = user?.display_name || user?.name || '';
	const avatarUrl = user?.avatar_URL ? getProcessedGravatarUrl( user.avatar_URL ) : null;
	const avatarImg = avatarUrl ? (
		<PreloadedImage
			className="user-avatar__image"
			src={ avatarUrl }
			alt={ name }
			width={ size }
			height={ size }
			imgStyles={ { maxWidth: size, height: size, borderRadius: '50%' } } // Override global styles. Always render avatar at the specified size.
		/>
	) : (
		<UserAvatarDefaultIcon iconSize={ size } />
	);

	// Prefetching so that we can display WPCOM users Hovercards instantly, Gravatar lookups will be triggered on hover.
	useQuery( userQuery( user?.wpcom_login, user?.wpcom_id, ! hideHovercard ) );

	const handleMouseEnter = useCallback( () => {
		hoverTimerRef.current = setTimeout( () => setIsHovered( true ), 200 );
	}, [] );

	const handleMouseLeave = useCallback( () => {
		if ( hoverTimerRef.current ) {
			clearTimeout( hoverTimerRef.current );
			hoverTimerRef.current = null;
		}
		setIsHovered( false );
	}, [] );

	return (
		<div
			ref={ avatarRef }
			className="user-avatar ignore-click"
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			{ wpcomProfileUrl ? <a href={ wpcomProfileUrl }>{ avatarImg }</a> : avatarImg }

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
