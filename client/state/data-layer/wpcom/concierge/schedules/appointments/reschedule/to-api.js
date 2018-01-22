export default ( { beginTimestamp } ) => ( {
	begin_timestamp: beginTimestamp / 1000, // convert to UNIX timestamp.
} );
