import 'calypso/state/reader/init';
import { Moment } from 'moment';
import { AppState } from 'calypso/types';

export interface ReaderStreamsState {
	[ key: string ]: ReaderStreamState;
}

export interface ReaderStreamState {
	items: ReaderStreamItem[];
	selected: ReaderStreamItem | null;
	pendingItems: {
		lastUpdated: Moment | null;
		items: ReaderStreamItem[];
	};
	lastPage: boolean;
	isRequesting: boolean;
	pageHandle?: {
		page_handle: string;
	};
}

export interface ReaderStreamItem {
	blogId: number;
	date: string;
	feed_ID: number;
	feed_URL: string;
	postId: number;
	site_description: string | undefined;
	site_icon: string;
	site_name: string;
	url: string;
}

const emptyStream = {
	items: [],
	pendingItems: { lastUpdated: null, items: [] },
	selected: null,
	lastPage: false,
	isRequesting: false, // `true` may prevent the stream from requesting at all, as is the case with the recommendations stream.
};

function getStream( state: AppState, streamKey: string ): ReaderStreamState {
	return state.reader.streams[ streamKey ] || emptyStream;
}

export default getStream;
