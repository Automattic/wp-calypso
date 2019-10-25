/**
 * External dependencies
 */
import { get, map } from 'lodash';
import { getLocaleSlug } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import getPublicizeConnection from 'state/selectors/get-publicize-connection';

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
	const localeSlug = getLocaleSlug();

	return map(
		postShareActions,
		( { ID, connection_id, message, result, share_date, status, external_url: url } ) => {
			const connection = getPublicizeConnection( state, connection_id );
			const actionDate = moment( share_date ).locale( localeSlug );

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
