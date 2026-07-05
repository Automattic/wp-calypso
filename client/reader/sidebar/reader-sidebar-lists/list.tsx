import { ReadList } from '@automattic/api-core';
import ListItem from './list-item';
import ListItemCreateLink from './list-item-create-link';

interface ReaderSidebarListsListProps {
	lists?: ReadList[];
	path: string;
	currentListOwner?: string;
	currentListSlug?: string;
}

function ReaderSidebarListsList( props: ReaderSidebarListsListProps ): JSX.Element | null {
	const { lists, currentListOwner, currentListSlug, path } = props;

	if ( ! lists ) {
		return null;
	}

	return (
		<>
			{ lists.map( ( list ) => (
				<ListItem
					key={ list.ID }
					list={ list }
					path={ path }
					currentListOwner={ currentListOwner }
					currentListSlug={ currentListSlug }
				/>
			) ) }
			<ListItemCreateLink path={ path } />
		</>
	);
}

export default ReaderSidebarListsList;
