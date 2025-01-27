import { map } from 'lodash';
import getPublicizeConnection from 'calypso/state/selectors/get-publicize-connection';

/**
 * Propagate publicize-connections with the share actions
 * passed as a parameter.
 * Thus, it returns richest array adding and crossing information for each action.
 * @param  {Object} state - Global state tree
 * @param  {Array} postShareActions - share actions of a post
 * @returns {Array} richest post actions array
 */
export function enrichPublicizeActionsWithConnections( state, postShareActions ) {
	return map(
		postShareActions,
		( { ID, connection_id, message, result, share_date, status, external_url: url } ) => {
			const connection = getPublicizeConnection( state, connection_id );

			return {
				ID,
				connectionId: connection?.ID,
				connection,
				connectionName: connection?.external_display,
				message,
				result,
				service: connection?.service,
				date: share_date,
				status,
				url,
			};
		}
	);
}
