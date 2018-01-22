export default ( { beginTimestamp, customerId, siteId, meta } ) => ( {
	begin_timestamp: beginTimestamp / 1000, // convert to UNIX timestamp.
	customer_id: customerId,
	site_id: siteId,
	meta: JSON.stringify( meta ),
} );
