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
 * Returns an array of known connections for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} userId User ID to filter
 * @return {Array}         User connections
 */
export function getConnectionsBySiteIdUserId( state, siteId, userId ) {
	const connectionsBySiteId = getConnectionsBySiteId( state, siteId );

	return connectionsBySiteId.filter( ( connection ) => {
		return connection.shared || connection.keyring_connection_user_ID === userId;
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
