import { useState, type ReactNode } from 'react';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { ShelfPickerModal } from './shelf-picker-modal';

interface Options {
	feedId?: number;
	blogId?: number;
	feedUrl: string;
	/** Follow source recorded when the picker subscribes the feed on open. */
	followApiSource?: string;
	/** Where the picker was opened from, for the click Tracks event. */
	source: string;
}

/**
 * Shared open-state + Tracks event + rendered `ShelfPickerModal` for the surfaces
 * that let a user add a site to a Shelf (the full-post action bar and the post
 * actions row). Returns the opener to wire to a button and the modal element to
 * render; the modal is `null` until opened.
 */
export function useShelfPicker( { feedId, blogId, feedUrl, followApiSource, source }: Options ): {
	openShelfPicker: () => void;
	shelfPickerModal: ReactNode;
} {
	const dispatch = useDispatch();
	const [ isOpen, setIsOpen ] = useState( false );

	const openShelfPicker = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_subscribe_shelf_button_clicked', {
				feed_id: feedId,
				blog_id: blogId,
				source,
			} )
		);
		setIsOpen( true );
	};

	const shelfPickerModal = isOpen ? (
		<ShelfPickerModal
			feedId={ feedId }
			blogId={ blogId }
			feedUrl={ feedUrl }
			followApiSource={ followApiSource }
			onClose={ () => setIsOpen( false ) }
		/>
	) : null;

	return { openShelfPicker, shelfPickerModal };
}
