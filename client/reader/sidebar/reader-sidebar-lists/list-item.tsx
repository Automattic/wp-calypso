import { ReadList } from '@automattic/api-core';
import { isAutomatticianQuery } from '@automattic/api-queries';
import { Count } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import AutoDirection from 'calypso/components/auto-direction';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';
import { MoreMenuActions } from '../more-menu-actions';

interface ReaderSidebarListsListItemProps {
	list: ReadList;
	path: string;
	currentListOwner?: string;
	currentListSlug?: string;
}

const ReaderSidebarListsListItem = ( {
	list,
	path,
	currentListOwner,
	currentListSlug,
}: ReaderSidebarListsListItemProps ) => {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const currentUser = useSelector( getCurrentUser );
	const itemRef = useRef< HTMLLIElement >( null );

	useEffect( () => {
		// Scroll to the current list
		if ( list.slug === currentListSlug && list.owner === currentListOwner ) {
			itemRef.current?.scrollIntoView();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item' );
		recordGaEvent( 'Clicked Reader Sidebar List Item' );
		recordReaderTracksEvent( 'calypso_reader_sidebar_list_item_clicked', {
			list: decodeURIComponent( list.slug ),
		} );
	};

	const listRelativeUrl = `/reader/list/${ list.owner }/${ list.slug }`;
	const listManagementUrls = [
		listRelativeUrl + '/items',
		listRelativeUrl + '/edit',
		listRelativeUrl + '/export',
		listRelativeUrl + '/delete',
	];

	const pathSegments = path?.split( '/' );
	const lastPathSegment = Array.isArray( pathSegments ) && pathSegments[ pathSegments.length - 1 ];
	const isCurrentList =
		lastPathSegment &&
		// Prevents partial slug matches (e.g. bluefuton/test and bluefuton/test2)
		lastPathSegment.toLowerCase() === list.slug.toLowerCase() &&
		ReaderSidebarHelper.pathStartsWithOneOf( [ listRelativeUrl ], path );
	const isCurrentListManage = ReaderSidebarHelper.pathStartsWithOneOf( listManagementUrls, path );

	const selected = Boolean( isCurrentList || isCurrentListManage );

	// Show author name in parentheses if the list is owned by someone other than the current user
	const isOwnedByCurrentUser = currentUser && list.owner === currentUser.username;
	const displayTitle = isOwnedByCurrentUser ? list.title : `${ list.title } (${ list.owner })`;
	const isSeenEnabled = isAutomattician;
	const unseenCount = list.feeds?.reduce( ( t, feed ) => t + ( feed.unseen_count ?? 0 ), 0 ) ?? 0;
	const feedIds = list.feeds?.map( ( feed ) => feed.feed_id ) ?? [];

	return (
		<MenuItem
			ref={ itemRef }
			className="sidebar__menu-item--reader-list"
			key={ list.ID }
			selected={ selected }
		>
			<MenuItemLink
				className="sidebar__menu-link"
				href={ listRelativeUrl }
				onClick={ handleListSidebarClick }
				title={ translate( "View list '%(currentListName)s'", {
					textOnly: true,
					args: {
						currentListName: list.title,
					},
				} ) }
			>
				<AutoDirection>
					<div className="sidebar__menu-item-title" title={ displayTitle }>
						{ displayTitle }
					</div>
				</AutoDirection>
				{ isSeenEnabled && (
					<span className="sidebar__actions-and-count">
						<MoreMenuActions
							identifier="sidebar-list"
							feedIds={ feedIds }
							feedUrls={ [] }
							unseenCount={ unseenCount }
						/>
						{ unseenCount > 0 && <Count count={ unseenCount } compact /> }
					</span>
				) }
			</MenuItemLink>
		</MenuItem>
	);
};

export default ReaderSidebarListsListItem;
