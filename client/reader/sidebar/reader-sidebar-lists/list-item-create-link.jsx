import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderAddIcon from 'calypso/reader/components/icons/add-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

export default function ReaderSidebarListsListItemCreateLink( { path } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item_create_link' );
		recordGaEvent( 'Clicked Reader Sidebar List Item Create Link' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_list_item_create_link_clicked' ) );
	};

	const newListPath = '/reader/list/new';
	const selected = ReaderSidebarHelper.pathStartsWithOneOf( [ newListPath ], path );

	return (
		<MenuItem className="sidebar__menu-item--create-reader-list-link" selected={ selected }>
			<MenuItemLink href={ newListPath } onClick={ handleListSidebarClick }>
				<div className="sidebar__menu-item-title">
					<ReaderAddIcon />
					<span className="sidebar__menu-item-title-text">{ translate( 'Create new list' ) }</span>
				</div>
			</MenuItemLink>
		</MenuItem>
	);
}
