/**
 * External dependencies
 */
import { listen } from 'push-receiver';
import request from 'request-promise';

// /**
//  * Marks a push token as approved on WPCOM API
//  * @param {string} pushToken push token that recieved via a push notification on an app
//  * @param {string} bearerToken user bearer token to be used with the API
//  * @returns {boolean} true if token approved
//  */
export const approvePushToken = async ( pushToken, bearerToken ) => {
	const responseString = await request( {
		url: 'https://public-api.wordpress.com/rest/v1.1/me/two-step/push-authentication',
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ bearerToken }`,
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
		},
		form: {
			action: 'authorize_login',
			push_token: pushToken,
		},
	} );
	const res = JSON.parse( responseString );
	if ( ! res.success ) {
		throw new Error(
			`Failed to authnticate via supplied push token ${ pushToken } got ${ responseString }`
		);
	}
	return true;
};

/**
 * Extracts specific appData value and notification's persistent id
 *
 * @param {string} filter appData key to match
 * @param {Function} addPersistentId a function to call with notification's persistent id
 * @param {Function} callback a function to call with a matching appData pair's value when filter matches
 * @returns {Function} a funciton that can be used as a notifications callback
 */
function filterPushDataKey( filter, addPersistentId, callback ) {
	return function pushDataFilter( notification ) {
		addPersistentId( notification.persistentId );

		const appData = notification.appData.find( ( data ) => data.key === filter );

		if ( appData ) {
			callback( appData.value );
		}
	};
}

/**
 * Listens to push notifications with push token
 *
 * @param {object} pushConfig GCM keys and tokens
 * @param {Function} callback a function to call when we get a push token
 */
export const subscribeToPush = ( pushConfig, callback ) => {
	const persistentIds = [];
	let connection;
	listen(
		pushConfig,
		filterPushDataKey(
			'push_auth_token',
			( id ) => persistentIds.push( id ),
			( pushToken ) => {
				connection.close();
				// we're connecting again to complete a login and mark that way that we saw those notifications persistentIds
				let markPersistentConnection;
				listen(
					{
						...pushConfig,
						persistentIds,
					},
					() => {},
					() => markPersistentConnection.close()
				).then( ( conn ) => ( markPersistentConnection = conn ) );

				callback( pushToken );
			}
		)
	).then( ( conn ) => ( connection = conn ) );
};
