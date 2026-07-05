import './style.scss';

import { ReadList } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import ReaderSidebarListsList from './list';

interface ReaderSidebarListsProps {
	lists?: ReadList[];
	path: string;
	isOpen?: boolean;
	onClick?: () => void;
	currentListOwner?: string;
	currentListSlug?: string;
}

const ReaderSidebarLists = ( {
	isOpen,
	onClick,
	path,
	...passedProps
}: ReaderSidebarListsProps ): JSX.Element => {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	function navigateToLists() {
		page( '/reader/lists' );
		recordReaderTracksEvent( 'calypso_reader_sidebar_lists_dropdown_title_clicked' );
	}

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Lists' ) }
				onClick={ navigateToLists }
				disableFlyout
				className={ path === '/reader/lists' ? 'sidebar__menu--selected' : '' }
				expandableIconClick={ onClick }
			>
				<ReaderSidebarListsList path={ path } { ...passedProps } />
			</ExpandableSidebarMenu>
		</li>
	);
};

export default ReaderSidebarLists;
