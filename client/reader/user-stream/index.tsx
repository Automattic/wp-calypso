import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { UserData } from 'calypso/lib/user/user';
import { requestUser } from 'calypso/state/reader/users/actions';
import UserLists from './views/lists';
import UserPosts from './views/posts';
import './style.scss';

interface NavigationItem {
	label: string;
	path: string;
	selected: boolean;
}

interface UserStreamProps {
	streamKey?: string;
	userId: string;
	user: UserData;
	isLoading: boolean;
	requestUser: ( userId: string ) => Promise< void >;
}

type UserStreamState = {
	reader: {
		users: {
			items: Record< string, UserData >;
			requesting: Record< string, boolean >;
		};
	};
};

export function UserStream( { userId, requestUser, user, streamKey, isLoading }: UserStreamProps ) {
	useEffect( () => {
		requestUser( userId );
	}, [ userId, requestUser ] );

	const translate = useTranslate();

	if ( isLoading || ! user ) {
		return <></>;
	}

	const currentPath = page.current;

	const navigationItems: NavigationItem[] = [
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

	const renderContent = (): React.ReactNode => {
		const basePath = currentPath.split( '?' )[ 0 ];

		switch ( basePath ) {
			case `/read/users/${ userId }`:
				return <UserPosts streamKey={ streamKey as string } />;
			case `/read/users/${ userId }/lists`:
				return <UserLists />;
		}
	};

	return (
		<div className="user-profile">
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
			<div className="user-profile__content-wrapper">
				<div className="user-profile__content">{ renderContent() }</div>
			</div>
		</div>
	);
}

export default connect(
	( state: UserStreamState, ownProps: UserStreamProps ) => ( {
		user: state.reader.users.items[ ownProps.userId ],
		isLoading: state.reader.users.requesting[ ownProps.userId ] ?? false,
	} ),
	{ requestUser }
)( UserStream );
