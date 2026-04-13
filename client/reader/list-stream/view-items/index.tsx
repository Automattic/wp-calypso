import './style.scss';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import useGetListItemsQuery from 'calypso/reader/list/queries/use-get-list-items-query';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	getListByOwnerAndSlug,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import ListMissing from '../components/list-missing';
import ListStreamHeader from '../components/list-stream-header';
import type { ReaderListItem } from 'calypso/reader/list/queries/use-get-list-items-query';
import type { ReaderSite } from 'calypso/reader/sites-list/site-item';

interface ReaderList {
	ID: number;
	owner: string;
	slug: string;
	title: string;
	description?: string;
	is_public: boolean;
	is_owner: boolean;
}

type ListViewItemsProps = {
	owner: string;
	slug: string;
};

function normalizeListItem( item: ReaderListItem ): ReaderSite {
	const feed = item.meta?.data?.feed;
	return {
		siteId: feed?.blog_ID,
		feedId: feed?.feed_ID,
		name: feed?.name,
		feedUrl: feed?.feed_URL,
		image: feed?.image,
	};
}

export function ListViewItems( { owner, slug }: ListViewItemsProps ) {
	const translate = useTranslate();
	const list = useSelector( ( state ) =>
		getListByOwnerAndSlug( state, owner, slug )
	) as ReaderList;
	const isMissing = useSelector( ( state ) => isMissingByOwnerAndSlug( state, owner, slug ) );
	const currentUser = useSelector( getCurrentUser );
	const { data, isLoading } = useGetListItemsQuery( owner, slug );

	if ( isMissing ) {
		return <ListMissing />;
	}

	if ( isLoading ) {
		return null;
	}

	const sites = data?.items?.map( normalizeListItem );
	if ( ! sites?.length ) {
		return (
			<EmptyContent
				className="view-list__empty-content"
				title={ translate( 'Empty List' ) }
				line={ translate( 'This list does not have any sites yet.' ) }
			/>
		);
	}

	const isOwnedByCurrentUser = currentUser && list?.owner === currentUser.username;
	const title = isOwnedByCurrentUser ? (
		list?.title
	) : (
		<>
			{ list?.title } (<a href={ `/reader/users/${ list?.owner }` }>{ list?.owner }</a>)
		</>
	);

	return (
		<ReaderMain>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: list?.title ?? translate( 'List' ),
				} ) }
			/>
			<QueryReaderList owner={ owner } slug={ slug } />
			<ListStreamHeader
				isPublic={ list?.is_public }
				title={ title }
				description={ list?.description }
				showFollow
			/>

			<ReaderSitesList sites={ sites } followSource="reader-list-view-items" variant="card" />
		</ReaderMain>
	);
}

export default ListViewItems;
