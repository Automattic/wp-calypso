import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { SortControls } from 'calypso/landing/subscriptions/components/sort-controls';
import {
	SAVED_OLDEST_PUBLISHED_STREAM_KEY,
	SAVED_OLDEST_STREAM_KEY,
	SAVED_PUBLISHED_STREAM_KEY,
} from 'calypso/reader/data/stream/build-query-params';
import Stream from 'calypso/reader/stream';
import EmptyContent from './empty';

interface SavedPostsStreamProps {
	streamKey: string;
	trackScrollPage: () => void;
	onUpdatesShown?: () => void;
}

const emptyContent = () => <EmptyContent />;

const SORT_STORAGE_KEY = 'reader_saved_sort';

const STORABLE_STREAM_KEYS = [
	SAVED_OLDEST_STREAM_KEY,
	SAVED_PUBLISHED_STREAM_KEY,
	SAVED_OLDEST_PUBLISHED_STREAM_KEY,
];

function getStoredStreamKey( fallback: string ): string {
	try {
		const stored = window.localStorage.getItem( SORT_STORAGE_KEY );
		return stored && STORABLE_STREAM_KEYS.includes( stored ) ? stored : fallback;
	} catch {
		return fallback;
	}
}

function storeStreamKey( streamKey: string ) {
	try {
		window.localStorage.setItem( SORT_STORAGE_KEY, streamKey );
	} catch {}
}

export default function SavedPostsStream( props: SavedPostsStreamProps ) {
	const translate = useTranslate();
	const [ streamKey, setStreamKey ] = useState( () => getStoredStreamKey( props.streamKey ) );

	const title = translate( 'Saved' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "Saved"',
	} );
	const sortOptions = [
		{ value: props.streamKey, label: translate( 'Recently saved' ) },
		{ value: SAVED_OLDEST_STREAM_KEY, label: translate( 'Oldest saved' ) },
		{ value: SAVED_PUBLISHED_STREAM_KEY, label: translate( 'Recently published' ) },
		{ value: SAVED_OLDEST_PUBLISHED_STREAM_KEY, label: translate( 'Oldest published' ) },
	];
	const handleSortChange = ( value: string ) => {
		setStreamKey( value );
		storeStreamKey( value );
	};

	return (
		<Stream
			{ ...props }
			key={ streamKey }
			streamKey={ streamKey }
			emptyContent={ emptyContent }
			showFollowInHeader
		>
			<DocumentHead title={ documentTitle } />
			<NavigationHeader title={ title } subtitle={ translate( 'Your reading list for later.' ) }>
				<SortControls options={ sortOptions } value={ streamKey } onChange={ handleSortChange } />
			</NavigationHeader>
		</Stream>
	);
}
