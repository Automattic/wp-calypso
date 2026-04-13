import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import ReaderMain from 'calypso/reader/components/reader-main';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followList, unfollowList } from 'calypso/state/reader/lists/actions';
import {
	getListByOwnerAndSlug,
	isSubscribedByOwnerAndSlug,
	hasRequestedListByOwnerAndSlug,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import EmptyContent from './empty';
import ListStreamHeader from './header';
import { ListSitesDirectory } from './list-sites-directory';
import ListMissing from './missing';
import { usePublicListQuery } from './use-public-list-query';
import './style.scss';

const TAB_POSTS = 'posts';
const TAB_SITES = 'sites';

function ListStream( props ) {
	const { owner, slug } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ activeTab, setActiveTab ] = useState( TAB_POSTS );

	const list = useSelector( ( state ) => getListByOwnerAndSlug( state, owner, slug ) );
	const isSubscribed = useSelector( ( state ) => isSubscribedByOwnerAndSlug( state, owner, slug ) );
	const hasRequested = useSelector( ( state ) =>
		hasRequestedListByOwnerAndSlug( state, owner, slug )
	);
	const isMissing = useSelector( ( state ) => isMissingByOwnerAndSlug( state, owner, slug ) );
	const currentUser = useSelector( getCurrentUser );

	const { data: publicListData } = usePublicListQuery( owner, slug );

	const shouldShowFollow = list && ! list.is_owner;

	function toggleFollowing( isFollowRequested ) {
		if ( isFollowRequested ) {
			dispatch( followList( list.owner, list.slug ) );
		} else {
			dispatch( unfollowList( list.owner, list.slug ) );
		}

		recordAction( isFollowRequested ? 'followed_list' : 'unfollowed_list' );
		recordGaEvent(
			isFollowRequested ? 'Clicked Follow List' : 'Clicked Unfollow List',
			list.owner + ':' + list.slug
		);
		dispatch(
			recordReaderTracksEvent(
				isFollowRequested
					? 'calypso_reader_reader_list_followed'
					: 'calypso_reader_reader_list_unfollowed',
				{
					list_owner: list.owner,
					list_slug: list.slug,
				}
			)
		);
	}

	if ( ! hasRequested ) {
		return <QueryReaderList owner={ owner } slug={ slug } />;
	}

	let pageTitle = translate( 'Loading list' );
	let formattedTitle = pageTitle;
	if ( list ) {
		const isOwnedByCurrentUser = currentUser && list.owner === currentUser.username;
		pageTitle = isOwnedByCurrentUser ? list.title : `${ list.title } (${ list.owner })`;
		formattedTitle = isOwnedByCurrentUser ? (
			list.title
		) : (
			<>
				{ list.title } (<a href={ `/reader/users/${ list.owner }` }>{ list.owner }</a>)
			</>
		);
	}

	if ( isMissing ) {
		return <ListMissing owner={ owner } slug={ slug } />;
	}

	const listStreamIconClasses = 'gridicon gridicon__list';
	const EmptyContentWithList = () => <EmptyContent list={ list } />;
	EmptyContentWithList.displayName = 'EmptyContentWithList';

	function handleTabChange( tab ) {
		setActiveTab( tab );
		if ( tab === TAB_SITES ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_list_sites_tab_viewed', {
					list_owner: owner,
					list_slug: slug,
				} )
			);
		}
	}

	return (
		<ReaderMain>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: pageTitle,
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>
			<QueryReaderList owner={ owner } slug={ slug } />
			<ListStreamHeader
				isPublic={ list?.is_public }
				icon={
					<svg
						className={ listStreamIconClasses }
						height="32"
						width="32"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<g>
							<path
								d="M9 19h10v-2H9v2zm0-6h10v-2H9v2zm0-8v2h10V5H9zm-3-.5c-.828
								0-1.5.672-1.5 1.5S5.172 7.5 6 7.5 7.5 6.828 7.5 6 6.828 4.5 6
								4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672
								1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5
								1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"
							/>
						</g>
					</svg>
				}
				title={ formattedTitle }
				description={ list?.description }
				showFollow={ shouldShowFollow }
				following={ isSubscribed }
				onFollowToggle={ toggleFollowing }
				showEdit={ list && list.is_owner }
				editUrl={ window.location.href + '/edit' }
				tags={ publicListData?.tags }
				items={ publicListData?.items }
			/>

			<SectionNav className="list-stream__tabs" variation="minimal">
				<NavTabs>
					<NavItem
						selected={ activeTab === TAB_POSTS }
						onClick={ () => handleTabChange( TAB_POSTS ) }
					>
						{ translate( 'Posts' ) }
					</NavItem>
					<NavItem
						selected={ activeTab === TAB_SITES }
						onClick={ () => handleTabChange( TAB_SITES ) }
						count={ publicListData?.item_count }
					>
						{ translate( 'Sites' ) }
					</NavItem>
				</NavTabs>
			</SectionNav>

			{ activeTab === TAB_POSTS && (
				<Stream
					{ ...props }
					isMain={ false }
					listName={ pageTitle }
					emptyContent={ EmptyContentWithList }
					showFollowInHeader={ false }
				/>
			) }

			{ activeTab === TAB_SITES && publicListData && (
				<ListSitesDirectory items={ publicListData.items } followSource="reader-list-sites-tab" />
			) }
		</ReaderMain>
	);
}

export default ListStream;
