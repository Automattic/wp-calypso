import { ReactNode } from 'react';
import ListEmpty from 'calypso/reader/list/components/empty';
import { ReaderList } from 'calypso/reader/list-manage/types';
import Stream from 'calypso/reader/stream';

interface ListPostsProps {
	list?: ReaderList;
	listName: string;
	streamKey: string;
	trackScrollPage?: () => void;
	onUpdatesShown?: () => void;
	children?: ReactNode;
}

export default function ListPosts( props: ListPostsProps ) {
	const { list } = props;

	return (
		<Stream
			className="no-padding"
			streamKey={ props.streamKey }
			listName={ props.listName }
			showFollowInHeader={ list && ! list?.is_owner }
			emptyContent={ () => <ListEmpty list={ list } /> }
			trackScrollPage={ props.trackScrollPage }
			onUpdatesShown={ props.onUpdatesShown }
		>
			{ props.children }
		</Stream>
	);
}
