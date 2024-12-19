import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useParams } from 'react-router-dom';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import UserComments from './views/comments';
import UserLikes from './views/likes';
import UserLists from './views/lists';
import UserPosts from './views/posts';
import UserReposts from './views/reposts';

const UserStream = ( { streamKey } ) => {
	const translate = useTranslate();
	const { user_id: userId } = useParams();
	const currentPath = page.current;

	const navigationItems = [
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

	const renderContent = () => {
		const streamType = streamKey?.split( ':' )[ 0 ];

		switch ( streamType ) {
			case 'user-comments':
				return <UserComments />;
			case 'user-likes':
				return <UserLikes />;
			case 'user-reposts':
				return <UserReposts />;
			case 'user-lists':
				return <UserLists />;
			default:
				return <UserPosts />;
		}
	};

	return (
		<div>
			<SectionNav>
				<NavTabs>
					{ navigationItems.map( ( item ) => (
						<NavItem key={ item.path } path={ item.path } selected={ item.selected }>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
			{ renderContent() }
		</div>
	);
};

export default UserStream;
