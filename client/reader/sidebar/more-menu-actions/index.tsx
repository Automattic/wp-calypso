import './style.scss';

import { DropdownMenu } from '@wordpress/components';
import { check, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMarkAllAsSeenMutation } from 'calypso/reader/data/seen-posts';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

type MoreMenuActionsProps = {
	identifier: string;
	feedIds: number[];
	feedUrls: string[];
	unseenCount?: number;
};

export function MoreMenuActions( {
	identifier,
	feedIds,
	feedUrls,
	unseenCount,
}: MoreMenuActionsProps ) {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const { mutate: markAllAsSeen } = useMarkAllAsSeenMutation();

	const handleMarkAllAsSeen = () => {
		recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked', { source: identifier } );
		markAllAsSeen( { identifier, feedIds, feedUrls } );
	};

	// The trigger sits inside an <a href> (menu-item rows) or an <a> with a
	// click handler (section header). stopPropagation prevents the row's own
	// click handler from firing; preventDefault stops the browser from
	// following the row's href.
	const swallowClick = ( event: React.MouseEvent ) => {
		event.stopPropagation();
		event.preventDefault();
	};

	// Only stop propagation for the keys that would activate the surrounding
	// row (Enter fires SidebarHeading's onClick; Space activates buttons).
	// Leave Tab, arrow keys, etc. alone so keyboard navigation still works.
	const swallowActivationKey = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.stopPropagation();
		}
	};

	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<span
			className="reader-sidebar__more-menu"
			onClick={ swallowClick }
			onKeyDown={ swallowActivationKey }
		>
			<DropdownMenu
				icon={ moreHorizontal }
				label={ translate( 'More actions' ) as string }
				className="reader-sidebar__more-menu-dropdown"
				popoverProps={ {
					className: 'reader-sidebar__more-menu-dropdown-content',
					focusOnMount: true,
					placement: 'bottom-end',
				} }
				controls={ [
					{
						title: translate( 'Mark all as seen' ) as string,
						icon: check,
						onClick: handleMarkAllAsSeen,
						isDisabled: unseenCount === 0,
					},
				] }
			/>
		</span>
	);
}
