import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ComponentType } from 'react';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserData } from 'calypso/lib/user/user';
import withDimensions from 'calypso/lib/with-dimensions';

import './style.scss';

interface UserProfileHeaderProps {
	user: UserData;
	width?: number;
}

const UserProfileHeader = ( { user, width = 0 }: UserProfileHeaderProps ): JSX.Element => {
	const translate = useTranslate();
	const currentPath = window.location.pathname;
	const userId = user.ID;
	const narrowDisplay = width < 480;

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

	const avatarElement = (
		<div className="user-profile-header__avatar">
			<ReaderAvatar
				author={ { ...user, has_avatar: !! user.avatar_URL } }
				iconSize={ narrowDisplay ? 72 : 116 }
			/>
		</div>
	);

	const classes = clsx( 'user-profile-header', {
		'is-narrow': narrowDisplay,
	} );

	return (
		<div className={ classes }>
			<header className="user-profile-header__main">
				{ ! narrowDisplay && avatarElement }
				<div className="user-profile-header__details">
					<div className="user-profile-header__display-name">
						{ narrowDisplay && avatarElement }
						{ user.display_name }
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

export default withDimensions( UserProfileHeader ) as ComponentType<
	Omit< UserProfileHeaderProps, 'width' >
>;
