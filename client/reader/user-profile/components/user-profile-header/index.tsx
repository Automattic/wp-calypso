import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserData } from 'calypso/lib/user/user';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

import './style.scss';

interface UserProfileHeaderProps {
	user: UserData;
}

const UserProfileHeader = ( { user }: UserProfileHeaderProps ): JSX.Element => {
	const translate = useTranslate();
	const currentPath = page.current;
	const userProfileUrl = getUserProfileUrl( user.user_login ?? '' );
	const navigationItems = [
		{
			label: translate( 'Posts' ),
			path: userProfileUrl,
			selected: currentPath === userProfileUrl,
		},
		{
			label: translate( 'Lists' ),
			path: `${ userProfileUrl }/lists`,
			selected: currentPath === `${ userProfileUrl }/lists`,
		},
	];

	const selectedTab = navigationItems.find( ( item ) => item.selected )?.label || '';

	const avatarElement = (
		<ReaderAvatar author={ { ...user, has_avatar: !! user.avatar_URL } } iconSize={ 116 } />
	);

	return (
		<div className="user-profile-header">
			<header className="user-profile-header__main">
				<div className="user-profile-header__avatar user-profile-header__avatar-desktop">
					{ avatarElement }
				</div>
				<div className="user-profile-header__details">
					<div className="user-profile-header__display-name">
						<div className="user-profile-header__avatar user-profile-header__avatar-mobile">
							{ avatarElement }
						</div>
						{ user.display_name }
					</div>
					{ user.bio && (
						<div className="user-profile-header__bio">
							<p className="user-profile-header__bio-desc">{ user.bio }</p>
						</div>
					) }
				</div>
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
