/**
 * External dependencies
 */
import { get, map } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPublicizeConnection } from 'state/selectors/';

/**
 * Return a sharing-actions array propagaring data from publicize connections,
 * creating a Date (moment) instance for the shareDate, etc.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Object} sharing actions array
 */
export default function getSitePostPublicizeSharingActions( state, siteId, postId ) {
	const rawActions = get( state, [ 'sharing', 'publicize', 'sharePostActions', 'items', siteId, postId ], null );

	if ( ! rawActions ) {
		return null;
	}

	return map( rawActions, ( {
		ID,
		connection_id,
		message,
		result,
		share_date,
		status,
		url,
	} ) => {
		const connection = getPublicizeConnection( state, connection_id );

		return {
			ID,
			connectionId: get( connection, 'ID' ),
			connection,
			externalName: get( connection, 'external_name' ),
			message,
			result,
			service: get( connection, 'service', 'twitter' ),
			shareDate: moment( share_date ).format( 'llll' ),
			status,
			url,
		};
	} );
}
