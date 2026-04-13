import './style.scss';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	getListByOwnerAndSlug,
	hasRequestedListByOwnerAndSlug,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import { ListMissing } from '../components/list-missing';
import ListStreamHeader from '../components/list-stream-header';

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

export function ListViewItems( { owner, slug }: ListViewItemsProps ) {
	const translate = useTranslate();
	const list = useSelector( ( state ) =>
		getListByOwnerAndSlug( state, owner, slug )
	) as ReaderList;
	const hasRequested = useSelector( ( state ) =>
		hasRequestedListByOwnerAndSlug( state, owner, slug )
	);
	const isMissing = useSelector( ( state ) => isMissingByOwnerAndSlug( state, owner, slug ) );
	const currentUser = useSelector( getCurrentUser );

	if ( ! hasRequested ) {
		return <QueryReaderList owner={ owner } slug={ slug } />;
	}

	if ( isMissing ) {
		return <ListMissing />;
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
			<div className="list-items__content">
				<p>{ translate( 'List items will be displayed here.' ) }</p>
			</div>
		</ReaderMain>
	);
}

export default ListViewItems;
