/** @format */

const emptyStream = {
	items: [],
	pendingItems: { lastUpdated: null, items: [] },
	lastPage: false,
	isRequesting: false,
};

function getStream( state, streamKey ) {
	return state.reader.streams[ streamKey ] || emptyStream;
}

export default getStream;
