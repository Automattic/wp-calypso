import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserData } from 'calypso/lib/user/user';

import './style.scss';

interface UserProfileHeaderProps {
	user: UserData;
}

const UserProfileHeader = ( { user }: UserProfileHeaderProps ): JSX.Element => {
	const translate = useTranslate();
	const currentPath = page.current;
	const userId = user.ID;

	const navigationItems = [
		{
			label: translate( 'Posts' ),
			path: `/read/users/${ userId }`,
			selected: currentPath === `/read/users/${ userId }`,
		},
		{
			label: translate( 'Lists' ),
			path: `/read/users/${ userId }/lists`,
			selected: currentPath === `/read/users/${ userId }/lists`,
		},
	];

	const selectedTab = navigationItems.find( ( item ) => item.selected )?.label || '';

	return (
		<div className="user-profile-header">
			<header className="user-profile-header__main">
				<ReaderAvatar author={ { ...user, has_avatar: !! user.avatar_URL } } />
				<div className="user-profile-header__details">
					<div className="user-profile-header__display-name">
						<ReaderAuthorLink author={ { name: user.display_name } }>
							{ user.display_name }
						</ReaderAuthorLink>
					</div>
					{ user.bio && (
						<div className="user-profile-header__bio">
							<p className="user-profile-header__bio-desc">{ user.bio }</p>
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
		</div>
	);
};

export default UserProfileHeader;
