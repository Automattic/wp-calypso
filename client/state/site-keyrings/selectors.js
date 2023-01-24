import 'calypso/state/site-keyrings/init';

const EMPTY_ARRAY = [];

/**
 * Returns true if we are requesting keyrings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site keyrings is being requested
 */
export function isRequestingSiteKeyrings( state, siteId ) {
	return state.siteKeyrings.requesting[ siteId ] ?? false;
}

/**
 * Returns the keyrings for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {Object}  Site keyrings indexed by keyring ids
 */
export function getSiteKeyrings( state, siteId ) {
	return state.siteKeyrings.items[ siteId ] ?? EMPTY_ARRAY;
}

/**
 * Returns the keyrings for the specified site ID and service
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  service The service name to filter with
 * @returns {Array}   Site keyrings list
 */
export function getSiteKeyringsForService( state, siteId, service ) {
	return getSiteKeyrings( state, siteId ).filter(
		( siteKeyring ) => siteKeyring.service === service
	);
}

/**
 * Returns the matching site keyring connection or undefined if it does not exist.
 *
 * @param  {Object}  state          Global state tree
 * @param  {number}  siteId         Site ID
 * @param  {number}  keyringId      Keyring Id
 * @param  {string}  externalUserId External User Id on the keyring
 * @returns {?Object}                Site Keyring connection
 */
export function getSiteKeyringConnection( state, siteId, keyringId, externalUserId = null ) {
	return getSiteKeyrings( state, siteId ).find( ( siteKeyring ) => {
		return (
			siteKeyring.keyring_id === keyringId &&
			( externalUserId === null || siteKeyring.external_user_id === externalUserId )
		);
	} );
}
