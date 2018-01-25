export default ( { beginTimestamp } ) => ( {
	begin_timestamp: Math.ceil( beginTimestamp / 1000 ), // convert to UNIX timestamp.
} );
