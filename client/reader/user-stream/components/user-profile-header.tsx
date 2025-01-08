import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserData } from 'calypso/lib/user/user';

interface NavigationItem {
	label: string;
	path: string;
	selected: boolean;
}

interface UserProfileHeaderProps {
	user: UserData;
	navigationItems: NavigationItem[];
	selectedTab: string;
}

const UserProfileHeader = ( {
	user,
	navigationItems,
	selectedTab,
}: UserProfileHeaderProps ): JSX.Element => (
	<>
		<header className="user-profile__header">
			<ReaderAvatar author={ { ...user, has_avatar: !! user.avatar_URL } } />
			<div className="user-profile-header__details">
				<div className="user-profile-header__display-name">
					<ReaderAuthorLink author={ { name: user.display_name } }>
						{ user.display_name }
					</ReaderAuthorLink>
				</div>
				{ user.bio && (
					<div className="user-profile-header__bio">
						<p>{ user.bio }</p>
					</div>
				) }
			</div>
		</header>
		<SectionNav selectedText={ selectedTab }>
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

export default UserProfileHeader;
