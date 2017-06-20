/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * External dependencies
 */

function JetpackRestApiClient( root, nonce ) {
	let apiRoot = root,
		headers = {
			'X-WP-Nonce': nonce
		},
		getParams = {
			credentials: 'same-origin',
			headers: headers
		},
		postParams = {
			method: 'post',
			credentials: 'same-origin',
			headers: assign( {}, headers, {
				'Content-type': 'application/json'
			} )
		};

	const methods = {
		setApiRoot( newRoot ) {
			apiRoot = newRoot;
		},
		setApiNonce( newNonce ) {
			headers = {
				'X-WP-Nonce': newNonce
			};
			getParams = {
				credentials: 'same-origin',
				headers: headers
			};
			postParams = {
				method: 'post',
				credentials: 'same-origin',
				headers: assign( {}, headers, {
					'Content-type': 'application/json'
				} )
			};
		},

		fetchSiteConnectionStatus: () => getRequest( `${ apiRoot }jetpack/v4/connection`, getParams )
			.then( response => response.json() ),

		fetchUserConnectionData: () => getRequest( `${ apiRoot }jetpack/v4/connection/data`, getParams )
			.then( response => response.json() ),

		disconnectSite: () => postRequest( `${ apiRoot }jetpack/v4/connection`, postParams, {
			body: JSON.stringify( { isActive: false } )
		} )
			.then( checkStatus )
			.then( response => response.json() ),

		fetchConnectUrl: () => getRequest( `${ apiRoot }jetpack/v4/connection/url`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		unlinkUser: () => postRequest( `${ apiRoot }jetpack/v4/connection/user`, postParams, {
			body: JSON.stringify( { linked: false } )
		} )
			.then( checkStatus )
			.then( response => response.json() ),

		jumpStart: ( action ) => {
			let active;
			if ( action === 'activate' ) {
				active = true;
			}
			if ( action === 'deactivate' ) {
				active = false;
			}
			return postRequest( `${ apiRoot }jetpack/v4/jumpstart`, postParams, {
				body: JSON.stringify( { active } )
			} )
				.then( checkStatus )
				.then( response => response.json() );
		},

		fetchModules: () => getRequest( `${ apiRoot }jetpack/v4/module/all`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		fetchModule: ( slug ) => getRequest( `${ apiRoot }jetpack/v4/module/${ slug }`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		activateModule: ( slug ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }/active`,
			postParams,
			{
				body: JSON.stringify( { active: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		deactivateModule: ( slug ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }/active`,
			postParams,
			{
				body: JSON.stringify( { active: false } )
			}
		),

		updateModuleOptions: ( slug, newOptionValues ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }`,
			postParams,
			{
				body: JSON.stringify( newOptionValues )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		updateSettings: ( newOptionValues ) => postRequest(
			`${ apiRoot }jetpack/v4/settings`,
			postParams,
			{
				body: JSON.stringify( newOptionValues )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		getProtectCount: () => getRequest( `${ apiRoot }jetpack/v4/module/protect/data`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		resetOptions: ( options ) => postRequest(
			`${ apiRoot }jetpack/v4/options/${ options }`,
			postParams,
			{
				body: JSON.stringify( { reset: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		getVaultPressData: () => getRequest( `${ apiRoot }jetpack/v4/module/vaultpress/data`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		getAkismetData: () => getRequest( `${ apiRoot }jetpack/v4/module/akismet/data`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		checkAkismetKey: () => getRequest( `${ apiRoot }jetpack/v4/module/akismet/key/check`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		checkAkismetKeyTyped: apiKey => postRequest(
			`${ apiRoot }jetpack/v4/module/akismet/key/check`,
			postParams,
			{
				body: JSON.stringify( { api_key: apiKey } )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		fetchStatsData: ( range ) => getRequest( statsDataUrl( range ), getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		getPluginUpdates: () => getRequest( `${ apiRoot }jetpack/v4/updates/plugins`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		fetchSettings: () => getRequest( `${ apiRoot }jetpack/v4/settings`, getParams )
			.then( checkStatus )
			.then( response => response.json() ),

		updateSetting: ( updatedSetting ) => postRequest( `${ apiRoot }jetpack/v4/settings`, postParams, {
			body: JSON.stringify( updatedSetting )
		} )
			.then( checkStatus )
			.then( response => response.json() ),

		fetchSiteData: () => getRequest( `${ apiRoot }jetpack/v4/site`, getParams )
			.then( checkStatus )
			.then( response => response.json() )
			.then( body => JSON.parse( body.data ) ),

		dismissJetpackNotice: ( notice ) => postRequest(
			`${ apiRoot }jetpack/v4/notice/${ notice }`,
			postParams,
			{
				body: JSON.stringify( { dismissed: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json() ),

		fetchPluginsData: () => getRequest( `${ apiRoot }jetpack/v4/plugins`, getParams )
			.then( checkStatus )
			.then( response => response.json() )
	};

	function addCacheBuster( route ) {
		const parts = route.split( '?' ),
			query = parts.length > 1
				? parts[ 1 ]
				: '',
			args = query.length
				? query.split( '&' )
				: [];

		args.push( '_cacheBuster=' + new Date().getTime() );

		return parts[ 0 ] + '?' + args.join( '&' );
	}

	function getRequest( route, params ) {
		return fetch( addCacheBuster( route ), params );
	}

	function postRequest( route, params, body ) {
		return fetch( route, assign( {}, params, body ) );
	}

	function statsDataUrl( range ) {
		let url = `${ apiRoot }jetpack/v4/module/stats/data`;
		if ( url.indexOf( '?' ) !== -1 ) {
			url = url + `&range=${ encodeURIComponent( range ) }`;
		} else {
			url = url + `?range=${ encodeURIComponent( range ) }`;
		}
		return url;
	}

	assign( this, methods );
}

const restApi = new JetpackRestApiClient();

restApi.setApiRoot( window.WP_API_root );
restApi.setApiNonce( window.WP_API_nonce );

export default restApi;

function checkStatus( response ) {
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}
	return response.json().then( json => {
		const error = new Error( json.message );
		error.response = json;
		throw error;
	} );
}