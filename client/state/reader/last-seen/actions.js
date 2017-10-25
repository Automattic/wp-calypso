export const updateLastSeenToken = ( streamId, token ) => ( {
	type: 'READER_LAST_SEEN_UPDATE',
	streamId,
	payload: token,
} );
