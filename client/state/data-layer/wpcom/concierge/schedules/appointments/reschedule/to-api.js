export default ( { appointmentDetails, beginTimestamp } ) => ( {
	begin_timestamp: beginTimestamp / 1000, // convert to UNIX timestamp.
	meta: JSON.stringify( appointmentDetails.meta ),
} );
