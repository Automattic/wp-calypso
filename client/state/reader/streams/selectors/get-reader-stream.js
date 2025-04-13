import 'calypso/state/reader/init';

const emptyStream = {
	items: [],
	pendingItems: { lastUpdated: null, items: [] },
	lastPage: false,
	isRequesting: true, // `true` indicates that the stream is yet to fetch.
};

function getStream( state, streamKey ) {
	return state.reader.streams[ streamKey ] || emptyStream;
}

export default getStream;
