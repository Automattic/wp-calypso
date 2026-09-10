import './style.scss';

import { ReadList } from '@automattic/api-core';
import { isAutomatticianQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderUnreadCount from 'calypso/layout/sidebar/reader-unread-count';
import MoreMenuActions from '../more-menu-actions';
import ReaderSidebarListsList from './list';

const RECOMMENDED_BLOGS_SLUG = 'recommended-blogs';

// The backend auto-creates a Recommended Blogs list for every user, so a brand
// new account would otherwise see it as its only list. Hide it until the user
// has either recommended something or created another list.
function hideEmptyRecommendedBlogsPlaceholder( lists?: ReadList[] ): ReadList[] | undefined {
	if ( lists?.length !== 1 ) {
		return lists;
	}
	const [ list ] = lists;
	const isEmptyOwnRecommendedBlogs =
		list.slug === RECOMMENDED_BLOGS_SLUG && list.is_owner && ! list.feeds?.length;
	return isEmptyOwnRecommendedBlogs ? [] : lists;
}

interface ReaderSidebarListsProps {
	lists?: ReadList[];
	path: string;
	isOpen?: boolean;
	onClick?: () => void;
	currentListOwner?: string;
	currentListSlug?: string;
}

const ReaderSidebarLists = ( {
	lists: allLists,
	isOpen,
	onClick,
	path,
	...passedProps
}: ReaderSidebarListsProps ): JSX.Element => {
	const translate = useTranslate();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const lists = hideEmptyRecommendedBlogsPlaceholder( allLists );
	const isChildSelected = lists?.some( ( list ) =>
		path.startsWith( `/reader/list/${ list.owner }/${ list.slug }` )
	);
	// Calculate the total unseen count across all lists and their feeds.
	const isSeenEnabled = isAutomattician;
	const totalUnseenCount: number =
		lists?.reduce(
			( total, list ) =>
				total +
				( list.feeds?.reduce( ( total, feed ) => total + ( feed.unseen_count ?? 0 ), 0 ) ?? 0 ),
			0 // Initial value of the list unseen count accumulator.
		) || 0;
	const allFeedIds =
		lists?.flatMap( ( list ) => list.feeds?.map( ( feed ) => feed.feed_id ) ?? [] ) ?? [];

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen ?? false }
				title={ translate( 'Lists' ) }
				customCount={ isSeenEnabled ? <ReaderUnreadCount count={ totalUnseenCount } /> : undefined }
				onClick={ onClick }
				disableFlyout
				className={ clsx( {
					'sidebar__menu--selected': ! isOpen && ( isChildSelected || path === '/reader/list/new' ),
				} ) }
				expandableIconClick={ onClick }
				moreMenuActions={
					<MoreMenuActions
						identifier=""
						isSingleFeed={ false }
						feedIds={ allFeedIds }
						feedUrls={ [] }
						source="sidebar-list-header"
						unseenCount={ totalUnseenCount }
					/>
				}
			>
				<ReaderSidebarListsList path={ path } lists={ lists } { ...passedProps } />
			</ExpandableSidebarMenu>
		</li>
	);
};

export default ReaderSidebarLists;
