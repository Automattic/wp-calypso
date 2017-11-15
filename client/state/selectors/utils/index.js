/** @format */

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
 * Propagate publicize-connections with the share actions
 * passed as a parameter.
 * Thus, it returns richest array adding and crossing information for each action.
 *
 * @param {Object} state - Global state tree
 * @param {Array} postShareActions - share actions of a post
 * @return {Array} richest post actions array
 */
export function enrichPublicizeActionsWithConnections( state, postShareActions ) {
	return map(
		postShareActions,
		( { ID, connection_id, message, result, share_date, status, external_url: url } ) => {
			const connection = getPublicizeConnection( state, connection_id );
			const actionDate = moment( share_date );

			return {
				ID,
				connectionId: get( connection, 'ID' ),
				connection,
				connectionName: get( connection, 'external_display' ),
				message,
				result,
				service: get( connection, 'service', 'twitter' ),
				shareDate: actionDate.format( 'llll' ),
				date: actionDate,
				status,
				url,
			};
		}
	);
}
