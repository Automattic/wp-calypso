import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderAddIcon from 'calypso/reader/components/icons/add-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';

export default function ReaderSidebarListsListItemCreateLink( { path } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item_create_link' );
		recordGaEvent( 'Clicked Reader Sidebar List Item Create Link' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_list_item_create_link_clicked' ) );
	};

	const newListPath = '/reader/list/new';
	const classes = clsx( 'sidebar__menu-item--create-reader-list-link', {
		selected: ReaderSidebarHelper.pathStartsWithOneOf( [ newListPath ], path ),
	} );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<li className={ classes }>
			<a className="sidebar__menu-link" href={ newListPath } onClick={ handleListSidebarClick }>
				<div className="sidebar__menu-item-title">
					<ReaderAddIcon />
					<span className="sidebar__menu-item-title-text">{ translate( 'Create new list' ) }</span>
				</div>
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
