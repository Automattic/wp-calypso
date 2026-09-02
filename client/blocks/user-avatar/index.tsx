import './style.scss';

import { UserResponse } from '@automattic/api-core';
import { userQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Popover } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	const avatarRef = useRef< HTMLDivElement >( null );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ placement, setPlacement ] = useState< 'bottom-start' | 'top-start' | 'right' | 'left' >(
		'bottom-start'
	);
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
			fallbackIcon={ <UserAvatarDefaultIcon iconSize={ size } /> }
		/>
	) : (
		<UserAvatarDefaultIcon iconSize={ size } />
	);
	// Prefetching so that we can display WPCOM users Hovercards instantly, Gravatar lookups will be triggered on hover.
	useQuery( userQuery( user?.wpcom_login, user?.wpcom_id, ! hideHovercard ) );

	// Compute the placement of the hovercard based on available space in the viewport.
	// This is done after we load the user data, so that we can take into account the height
	// of the hovercard which can vary based on the user data.
	const computePlacement = useCallback( ( user: UserResponse | null ) => {
		if ( ! avatarRef.current ) {
			return;
		}

		const hasPrimaryBlog = !! user?.primary_blog;
		const hasRecommendedBlogs = !! user?.recommended_blogs_count;

		let hovercardHeight = 330;
		if ( hasPrimaryBlog ) {
			hovercardHeight = 450;
		}
		if ( hasPrimaryBlog && hasRecommendedBlogs ) {
			hovercardHeight = 650;
		}

		const OFFSET = 5;
		const rect = avatarRef.current.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom - OFFSET;
		const spaceAbove = rect.top - OFFSET;

		if ( spaceBelow >= hovercardHeight ) {
			setPlacement( 'bottom-start' );
		} else if ( spaceAbove >= hovercardHeight ) {
			setPlacement( 'top-start' );
		} else {
			const spaceRight = window.innerWidth - rect.right - OFFSET;
			const spaceLeft = rect.left - OFFSET;
			setPlacement( spaceRight >= spaceLeft ? 'right' : 'left' );
		}
	}, [] );

	const clearHoverTimer = useCallback( () => {
		if ( hoverTimerRef.current ) {
			clearTimeout( hoverTimerRef.current );
			hoverTimerRef.current = null;
		}
	}, [] );

	const handleShowHovercard = useCallback( () => {
		clearHoverTimer();
		hoverTimerRef.current = setTimeout( () => setIsHovered( true ), 200 );
	}, [ clearHoverTimer ] );

	const handleHideHovercard = useCallback( () => {
		clearHoverTimer();
		hoverTimerRef.current = setTimeout( () => setIsHovered( false ), 100 );
	}, [ clearHoverTimer ] );

	return (
		<div
			ref={ avatarRef }
			className="user-avatar ignore-click"
			onMouseEnter={ handleShowHovercard }
			onMouseLeave={ handleHideHovercard }
			aria-label={ translate( 'User Profile: %s', { args: name } ) as string }
		>
			{ wpcomProfileUrl ? <a href={ wpcomProfileUrl }>{ avatarImg }</a> : avatarImg }

			{ user && ! hideHovercard && isHovered && (
				<Popover
					anchor={ avatarRef.current }
					variant="unstyled"
					offset={ 5 }
					placement={ placement }
					flip={ false } // We compute our own placement and don't want Popover to change it.
					focusOnMount={ false }
					noArrow
					onMouseEnter={ clearHoverTimer }
					onMouseLeave={ handleHideHovercard }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Escape' ) {
							setIsHovered( false );
						}
					} }
				>
					<UserHovercard user={ user } onUserLoaded={ computePlacement } />
				</Popover>
			) }
		</div>
	);
}
