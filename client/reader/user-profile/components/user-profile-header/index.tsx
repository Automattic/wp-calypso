import { external, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserProfileData } from 'calypso/lib/user/user';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

import './style.scss';

interface UserProfileHeaderProps {
	user: UserProfileData;
	view: string;
}

const UserProfileHeader = ( { user, view }: UserProfileHeaderProps ): JSX.Element => {
	const translate = useTranslate();
	const userProfileUrlWithUsername = getUserProfileUrl( user.user_login ?? '' );
	const navigationItems = [
		{
			label: translate( 'Posts' ),
			path: userProfileUrlWithUsername,
			selected: view === 'posts',
		},
		{
			label: translate( 'Lists' ),
			path: `${ userProfileUrlWithUsername }/lists`,
			selected: view === 'lists',
		},
		{
			label: translate( 'Recommended Blogs' ),
			path: `${ userProfileUrlWithUsername }/recommended-blogs`,
			selected: view === 'recommended-blogs',
		},
	];

	const selectedTab = navigationItems.find( ( item ) => item.selected )?.label || '';

	const avatarElement = (
		<ReaderAvatar author={ { ...user, has_avatar: !! user.avatar_URL } } iconSize={ 116 } />
	);

	const bioRef = useRef< HTMLSpanElement >( null );
	const [ isClamped, setIsClamped ] = useState( false );

	useEffect( () => {
		if ( bioRef.current ) {
			const element = bioRef.current;
			const originalHeight = element.offsetHeight;

			// Temporarily remove the clamp
			element.style.webkitLineClamp = 'unset';
			const fullHeight = element.scrollHeight;

			// Restore the clamp
			element.style.webkitLineClamp = '3';

			// Determine if the text is clamped
			setIsClamped( fullHeight > originalHeight );
		}
	}, [ user.bio ] );

	return (
		<div className="user-profile-header">
			<header className="user-profile-header__main">
				<div
					className="user-profile-header__avatar user-profile-header__avatar-desktop"
					data-testid="desktop-avatar"
				>
					{ avatarElement }
				</div>
				<AutoDirection>
					<div className="user-profile-header__details">
						<div className="user-profile-header__display-name">
							<div
								className="user-profile-header__avatar user-profile-header__avatar-mobile"
								data-testid="mobile-avatar"
							>
								{ avatarElement }
							</div>

							<h1>{ user.display_name }</h1>
						</div>
						{ user.bio && (
							<div className="user-profile-header__bio">
								<p className="user-profile-header__bio-desc">
									<span ref={ bioRef } className="user-profile-header__bio-desc-text">
										{ user.bio }
									</span>

									{ isClamped && user.profile_URL && (
										<>
											<span className="user-profile-header__bio-desc-fader"></span>
											<a className="user-profile-header__bio-desc-link" href={ user.profile_URL }>
												{ translate( 'Read More' ) }{ ' ' }
												<Icon width={ 18 } height={ 18 } icon={ external } />
											</a>
										</>
									) }
								</p>
							</div>
						) }
					</div>
				</AutoDirection>
			</header>
			<SectionNav enforceTabsView selectedText={ selectedTab }>
				<NavTabs>
					{ navigationItems.map( ( item ) => (
						<NavItem key={ item.path } path={ item.path } selected={ item.selected }>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
		</div>
	);
};

export default UserProfileHeader;
