import { Icon } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

interface ListItemCreateLinkProps {
	path: string;
}

export default function ListItemCreateLink( { path }: ListItemCreateLinkProps ): JSX.Element {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item_create_link' );
		recordGaEvent( 'Clicked Reader Sidebar List Item Create Link' );
		recordReaderTracksEvent( 'calypso_reader_sidebar_list_item_create_link_clicked' );
	};

	const newListPath = '/reader/list/new';
	const selected = ReaderSidebarHelper.pathStartsWithOneOf( [ newListPath ], path );

	return (
		<MenuItem selected={ selected }>
			<MenuItemLink
				href={ newListPath }
				onClick={ handleListSidebarClick }
				className="sidebar__menu-link"
			>
				<Icon icon={ plus } viewBox="2 0 24 24" />
				<span>{ translate( 'Create new list' ) }</span>
			</MenuItemLink>
		</MenuItem>
	);
}
