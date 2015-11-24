/**
 * Returns an array of known connections for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function getConnectionsBySiteId( state, siteId ) {
	const { connectionsBySiteId, connections } = state.sharing.publicize;

	if ( ! connectionsBySiteId[ siteId ] ) {
		return [];
	}

	return connectionsBySiteId[ siteId ].map( ( connectionId ) => {
		return connections[ connectionId ];
	} );
}

/**
 * Returns true if connections have been fetched for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function hasFetchedConnections( state, siteId ) {
	const { fetchingConnections } = state.sharing.publicize;
	return fetchingConnections.hasOwnProperty( siteId );
}

/**
 * Returns true if connections are currently fetching for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function isFetchingConnections( state, siteId ) {
	const { fetchingConnections } = state.sharing.publicize;
	return hasFetchedConnections( state, siteId ) && fetchingConnections[ siteId ];
}
