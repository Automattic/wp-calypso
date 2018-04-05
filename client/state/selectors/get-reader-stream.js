/** @format */

const emptyStream = { items: [], pendingItems: [], lastPage: false, isRequesting: false };

function getStream( state, streamKey ) {
	return state.reader.streams[ streamKey ] || emptyStream;
}

export default getStream;
