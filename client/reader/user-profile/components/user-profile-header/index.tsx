import './style.scss';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserProfileData } from 'calypso/lib/user/user';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

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

	return (
		<>
			<header className="user-profile-header">
				<div className="user-profile-header__user-info">
					<ReaderAvatar author={ { ...user, has_avatar: !! user.avatar_URL } } iconSize={ 56 } />
					<div className="user-profile-header__names">
						<h1>{ user.display_name }</h1>
						<p>@{ user.user_login }</p>
					</div>
				</div>

				{ user.bio && (
					<AutoDirection>
						<div className="user-profile-header__bio">
							<p className={ clsx( 'user-profile-header__bio-desc' ) }>{ user.bio }</p>
						</div>
					</AutoDirection>
				) }
			</header>
			<SectionNav enforceTabsView selectedText={ selectedTab } variation="minimal">
				<NavTabs>
					{ navigationItems.map( ( item ) => (
						<NavItem key={ item.path } path={ item.path } selected={ item.selected }>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
		</>
	);
};

export default UserProfileHeader;
