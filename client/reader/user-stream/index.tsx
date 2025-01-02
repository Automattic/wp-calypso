import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { fetchUser, ReaderUser } from 'calypso/state/reader/users/actions';
import UserComments from './views/comments';
import UserLikes from './views/likes';
import UserLists from './views/lists';
import UserPosts from './views/posts';
import UserReposts from './views/reposts';
import type { AppState } from 'calypso/types';
import './style.scss';

interface NavigationItem {
	label: string;
	path: string;
	selected: boolean;
}

interface UserStreamProps {
	streamKey?: string;
	userId: string;
}

const UserStream = ( { streamKey, userId }: UserStreamProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, Action > >();
	const currentPath = page.current;
	const [ user, setUser ] = useState< ReaderUser | null >( null );

	const navigationItems: NavigationItem[] = [
		{
			label: translate( 'Posts' ),
			path: `/read/users/${ userId }`,
			selected: currentPath === `/read/users/${ userId }`,
		},
		{
			label: translate( 'Comments' ),
			path: `/read/users/${ userId }/comments`,
			selected: currentPath === `/read/users/${ userId }/comments`,
		},
		{
			label: translate( 'Likes' ),
			path: `/read/users/${ userId }/likes`,
			selected: currentPath === `/read/users/${ userId }/likes`,
		},
		{
			label: translate( 'Reposts' ),
			path: `/read/users/${ userId }/reposts`,
			selected: currentPath === `/read/users/${ userId }/reposts`,
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
			case `/read/users/${ userId }/comments`:
				return <UserComments />;
			case `/read/users/${ userId }/likes`:
				return <UserLikes />;
			case `/read/users/${ userId }/reposts`:
				return <UserReposts />;
			case `/read/users/${ userId }/lists`:
				return <UserLists />;
		}
	};

	useEffect( () => {
		const fetchData = async () => {
			try {
				const data = await dispatch( fetchUser( userId ) );
				setUser( data );
			} catch ( error ) {
				// Handle error if needed
			}
		};
		fetchData();
	}, [ dispatch, userId ] );

	return (
		<div className="user-stream">
			<h1 className="user-stream__header">User Profile</h1>
			{ user && <ReaderAvatar author={ user } /> }
			<SectionNav selectedText={ selectedTab }>
				<NavTabs>
					{ navigationItems.map( ( item ) => (
						<NavItem key={ item.path } path={ item.path } selected={ item.selected }>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
			<div className="user-stream__content">{ renderContent() }</div>
		</div>
	);
};

export default UserStream;
