/**
 * External dependencies
 */
import { filter, map, property, delay } from 'lodash';
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import wporg from 'lib/wporg';
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	THEME_BACK_PATH_SET,
	THEME_CLEAR_ACTIVATED,
	THEME_DELETE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_TRY_AND_CUSTOMIZE_FAILURE,
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
} from 'state/action-types';
import {
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
import { getTheme, getActiveTheme, getLastThemeQuery, getThemeCustomizeUrl } from './selectors';
import {
	getThemeIdFromStylesheet,
	isThemeMatchingQuery,
	isThemeFromWpcom,
	normalizeJetpackTheme,
	normalizeWpcomTheme,
	normalizeWporgTheme
} from './utils';
import {
	getSiteTitle,
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSite
} from 'state/sites/selectors';
import i18n from 'i18n-calypso';
import accept from 'lib/accept';
import config from 'config';

const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

// Set destination for 'back' button on theme sheet
export function setBackPath( path ) {
	return {
		type: THEME_BACK_PATH_SET,
		path,
	};
}

/**
 * Returns an action object to be used in signalling that a theme object has
 * been received.
 *
 * @param  {Object} theme  Theme received
 * @param  {Number} siteId ID of site for which themes have been received
 * @return {Object}        Action object
 */
export function receiveTheme( theme, siteId ) {
	return receiveThemes( [ theme ], siteId );
}

/**
 * Returns an action object to be used in signalling that theme objects have
 * been received.
 *
 * @param  {Array}  themes Themes received
 * @param  {Number} siteId ID of site for which themes have been received
 * @return {Object}        Action object
 */
export function receiveThemes( themes, siteId ) {
	return {
		type: THEMES_RECEIVE,
		themes,
		siteId
	};
}

/**
 * Triggers a network request to fetch themes for the specified site and query.
 *
 * @param  {Number|String} siteId Jetpack site ID or 'wpcom' for any WPCOM site
 * @param  {String}        query  Theme query
 * @return {Function}             Action thunk
 */
export function requestThemes( siteId, query = {} ) {
	return ( dispatch, getState ) => {
		const startTime = new Date().getTime();
		let siteIdToQuery, queryWithApiVersion;

		if ( siteId === 'wpcom' ) {
			siteIdToQuery = null;
			queryWithApiVersion = { ...query, apiVersion: '1.2' };
		} else {
			siteIdToQuery = siteId;
			queryWithApiVersion = { ...query, apiVersion: '1' };
		}

		dispatch( {
			type: THEMES_REQUEST,
			siteId,
			query
		} );

		return wpcom.undocumented().themes( siteIdToQuery, queryWithApiVersion ).then( ( { found, themes: rawThemes } ) => {
			let themes;
			let filteredThemes;
			if ( siteId !== 'wpcom' ) {
				themes = map( rawThemes, normalizeJetpackTheme );

				// A Jetpack site's themes endpoint ignores the query,
				// returning an unfiltered list of all installed themes instead.
				// So we have to filter on the client side.
				// Also if Jetpack plugin has Themes Extended Features,
				// we filter out -wpcom suffixed themes because we will show them in
				// second list that is specific to WorpPress.com themes.
				const keepWpcom = ! config.isEnabled( 'manage/themes/upload' ) ||
					! hasJetpackSiteJetpackThemesExtendedFeatures( getState(), siteId );

				filteredThemes = filter(
					themes,
					theme => isThemeMatchingQuery( query, theme ) && ( keepWpcom || ! isThemeFromWpcom( theme.id ) )
				);
				// The Jetpack specific endpoint doesn't return the number of `found` themes, so we calculate it ourselves.
				found = filteredThemes.length;
			} else {
				themes = map( rawThemes, normalizeWpcomTheme );
				filteredThemes = themes;
			}

			if ( query.search && query.page === 1 ) {
				const responseTime = ( new Date().getTime() ) - startTime;
				const trackShowcaseSearch = recordTracksEvent(
					'calypso_themeshowcase_search',
					{
						search_term: query.search || null,
						tier: query.tier,
						response_time_in_ms: responseTime,
						result_count: found,
						results_first_page: filteredThemes.map( property( 'id' ) ).join()
					}
				);
				dispatch( trackShowcaseSearch );
			}

			// receiveThemes is query-agnostic, so it gets its themes unfiltered
			dispatch( receiveThemes( themes, siteId ) );
			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				themes: filteredThemes,
				siteId,
				query,
				found,
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId,
				query,
				error
			} );
		} );
	};
}

export function themeRequestFailure( siteId, themeId, error ) {
	return {
		type: THEME_REQUEST_FAILURE,
		siteId,
		themeId,
		error
	};
}

/**
 * Triggers a network request to fetch a specific theme from a site.
 *
 * @param  {String}   themeId Theme ID
 * @param  {Number}   siteId  Site ID
 * @return {Function}         Action thunk
 */
export function requestTheme( themeId, siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId
		} );

		if ( siteId === 'wporg' ) {
			return wporg.fetchThemeInformation( themeId ).then( ( theme ) => {
				// Apparently, the WP.org REST API endpoint doesn't 404 but instead returns false
				// if a theme can't be found.
				if ( ! theme ) {
					throw ( 'Theme not found' ); // Will be caught by .catch() below
				}
				dispatch( receiveTheme( normalizeWporgTheme( theme ), siteId ) );
				dispatch( {
					type: THEME_REQUEST_SUCCESS,
					siteId,
					themeId
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: THEME_REQUEST_FAILURE,
					siteId,
					themeId,
					error
				} );
			} );
		}

		if ( siteId === 'wpcom' ) {
			return wpcom.undocumented().themeDetails( themeId ).then( ( theme ) => {
				dispatch( receiveTheme( normalizeWpcomTheme( theme ), siteId ) );
				dispatch( {
					type: THEME_REQUEST_SUCCESS,
					siteId,
					themeId
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: THEME_REQUEST_FAILURE,
					siteId,
					themeId,
					error
				} );
			} );
		}

		// See comment next to lib/wpcom-undocumented/lib/undocumented#jetpackThemeDetails() why we can't
		// the regular themeDetails() method for Jetpack sites yet.
		return wpcom.undocumented().jetpackThemeDetails( themeId, siteId ).then( ( { themes } ) => {
			dispatch( receiveThemes( map( themes, normalizeJetpackTheme ), siteId ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch(
				themeRequestFailure( siteId, themeId, error )
			);
		} );
	};
}

/**
 * This action queries wpcom endpoint for active theme for site.
 * If request success information about active theme is stored in Redux themes subtree.
 * In case of error, error is stored in Redux themes subtree.
 *
 * @param  {Number}   siteId Site for which to check active theme
 * @return {Function}        Redux thunk with request action
 */
export function requestActiveTheme( siteId ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: ACTIVE_THEME_REQUEST,
			siteId,
		} );

		return wpcom.undocumented().activeTheme( siteId )
			.then( theme => {
				debug( 'Received current theme', theme );
				// We want to store the theme object in the appropriate Redux subtree -- either 'wpcom'
				// for WPCOM sites, or siteId for Jetpack sites.
				const siteIdOrWpcom = isJetpackSite( getState(), siteId ) ? siteId : 'wpcom';
				dispatch( receiveTheme( theme, siteIdOrWpcom ) );
				dispatch( {
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId,
					theme
				} );
			} ).catch( error => {
				dispatch( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to activate a specific theme on a given site.
 *
 * @param  {String}   themeId   Theme ID
 * @param  {Number}   siteId    Site ID
 * @param  {String}   source    The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased Whether the theme has been purchased prior to activation
 * @return {Function}           Action thunk
 */
export function activateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return dispatch => {
		dispatch( {
			type: THEME_ACTIVATE_REQUEST,
			themeId,
			siteId,
		} );

		return wpcom.undocumented().activateTheme( themeId, siteId )
			.then( ( theme ) => {
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch( themeActivated( themeStylesheet, siteId, source, purchased ) );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_ACTIVATE_REQUEST_FAILURE,
					themeId,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Returns an action thunk to be used in signalling that a theme has been activated
 * on a given site. Careful, this action is different from most others here in that
 * expects a theme stylesheet string (not just a theme ID).
 *
 * @param  {String}   themeStylesheet Theme stylesheet string (*not* just a theme ID!)
 * @param  {Number}   siteId          Site ID
 * @param  {String}   source          The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased       Whether the theme has been purchased prior to activation
 * @return {Function}                 Action thunk
 */
export function themeActivated( themeStylesheet, siteId, source = 'unknown', purchased = false ) {
	const themeActivatedThunk = ( dispatch, getState ) => {
		const action = {
			type: THEME_ACTIVATE_REQUEST_SUCCESS,
			themeStylesheet,
			siteId,
		};
		const previousThemeId = getActiveTheme( getState(), siteId );
		const query = getLastThemeQuery( getState(), siteId );

		const trackThemeActivation = recordTracksEvent(
			'calypso_themeshowcase_theme_activate',
			{
				theme: getThemeIdFromStylesheet( themeStylesheet ),
				previous_theme: previousThemeId,
				source: source,
				purchased: purchased,
				search_term: query.search || null
			}
		);
		dispatch( withAnalytics( trackThemeActivation, action ) );
	};
	return themeActivatedThunk; // it is named function just for testing purposes
}

/**
 * Triggers a network request to install a WordPress.org or WordPress.com theme on a Jetpack site.
 * To install a theme from WordPress.com, suffix the theme name with '-wpcom'. Note that this options
 * requires Jetpack 4.4
 *
 * @param  {String}   themeId Theme ID. If suffixed with '-wpcom', install from WordPress.com
 * @param  {String}   siteId  Jetpack Site ID
 * @return {Function}         Action thunk
 */
export function installTheme( themeId, siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_INSTALL,
			siteId,
			themeId
		} );

		return wpcom.undocumented().installThemeOnJetpack( siteId, themeId )
			.then( ( theme ) => {
				dispatch( receiveTheme( theme, siteId ) );
				dispatch( {
					type: THEME_INSTALL_SUCCESS,
					siteId,
					themeId
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_INSTALL_FAILURE,
					siteId,
					themeId,
					error
				} );
			} );
	};
}

/**
 * Returns an action object to be used in signalling that theme activated status
 * for site should be cleared
 *
 * @param  {Number}   siteId    Site ID
 * @return {Object}        Action object
 */
export function clearActivated( siteId ) {
	return {
		type: THEME_CLEAR_ACTIVATED,
		siteId
	};
}

/**
 * Triggers a network request to install theme on Jetpack site.
 * After installataion it switches page to the customizer
 * See installTheme doc for install options.
 * Requires Jetpack 4.4
 *
 * @param  {String}   themeId      WP.com Theme ID
 * @param  {String}   siteId       Jetpack Site ID
 * @return {Function}              Action thunk
 */
export function installAndTryAndCustomize( themeId, siteId ) {
	return ( dispatch ) => {
		return dispatch( installTheme( themeId, siteId ) )
			.then( () => {
				dispatch( tryAndCustomize( themeId, siteId ) );
			} );
	};
}

/**
 * Triggers a switch to the try&customize page of theme.
 * When theme is not available dispatches FAILURE action
 * that trigers displaying error notice by notices middlewaere
 *
 * @param  {String}   themeId      WP.com Theme ID
 * @param  {String}   siteId       Jetpack Site ID
 * @return {Function}              Action thunk
 */
export function tryAndCustomize( themeId, siteId ) {
	return ( dispatch, getState ) => {
		const theme = getTheme( getState(), siteId, themeId );
		if ( ! theme ) {
			dispatch( {
				type: THEME_TRY_AND_CUSTOMIZE_FAILURE,
				themeId,
				siteId
			} );
			return;
		}
		const url = getThemeCustomizeUrl( getState(), theme, siteId );
		page( url );
	};
}

/**
 * Triggers a network request to install and activate a specific theme on a given
 * Jetpack site. If the themeId parameter is suffixed with '-wpcom', install the
 * theme from WordPress.com. Otherwise, install from WordPress.org.
 *
 * @param  {String}   themeId   Theme ID. If suffixed with '-wpcom', install theme from WordPress.com
 * @param  {Number}   siteId    Site ID
 * @param  {String}   source    The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased Whether the theme has been purchased prior to activation
 * @return {Function}           Action thunk
 */
export function installAndActivate( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch ) => {
		return dispatch( installTheme( themeId, siteId ) )
			.then( () => {
				// This will be called even if `installTheme` silently fails. We rely on
				// `activateTheme`'s own error handling here.
				dispatch( activateTheme( themeId, siteId, source, purchased ) );
			} );
	};
}

/**
 * Triggers a theme upload to the given site.
 *
 * @param {Number} siteId -- Site to upload to
 * @param {File} file -- the theme zip to upload
 *
 * @return {Function} the action function
 */
export function uploadTheme( siteId, file ) {
	return dispatch => {
		dispatch( {
			type: THEME_UPLOAD_START,
			siteId,
		} );
		return wpcom.undocumented().uploadTheme( siteId, file, ( event ) => {
			dispatch( {
				type: THEME_UPLOAD_PROGRESS,
				siteId,
				loaded: event.loaded,
				total: event.total
			} );
		} )
			.then( ( theme ) => {
				dispatch( receiveTheme( theme, siteId ) );
				dispatch( {
					type: THEME_UPLOAD_SUCCESS,
					siteId,
					themeId: theme.id,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_UPLOAD_FAILURE,
					siteId,
					error
				} );
			} );
	};
}

/**
 * Clears any state remaining from a previous
 * theme upload to the given site.
 *
 * @param {Number} siteId -- site to clear state for
 *
 * @return {Object} the action object to dispatch
 */
export function clearThemeUpload( siteId ) {
	return {
		type: THEME_UPLOAD_CLEAR,
		siteId,
	};
}

/**
 * Start an Automated Transfer with an uploaded theme.
 *
 * @param {Number} siteId -- the site to transfer
 * @param {File} file -- theme zip to upload
 * @param {String} plugin -- plugin slug
 *
 * @returns {Promise} for testing purposes only
 */
export function initiateThemeTransfer( siteId, file, plugin ) {
	return dispatch => {
		dispatch( {
			type: THEME_TRANSFER_INITIATE_REQUEST,
			siteId,
		} );
		return wpcom.undocumented().initiateTransfer( siteId, plugin, file, ( event ) => {
			dispatch( {
				type: THEME_TRANSFER_INITIATE_PROGRESS,
				siteId,
				loaded: event.loaded,
				total: event.total,
			} );
		} )
			.then( ( { transfer_id } ) => {
				dispatch( {
					type: THEME_TRANSFER_INITIATE_SUCCESS,
					siteId,
					transferId: transfer_id,
				} );
				dispatch( pollThemeTransferStatus( siteId, transfer_id ) );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_TRANSFER_INITIATE_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

// receive a transfer status
function transferStatus( siteId, transferId, status, message, themeId ) {
	return {
		type: THEME_TRANSFER_STATUS_RECEIVE,
		siteId,
		transferId,
		status,
		message,
		themeId,
	};
}

// receive a transfer status error
function transferStatusFailure( siteId, transferId, error ) {
	return {
		type: THEME_TRANSFER_STATUS_FAILURE,
		siteId,
		transferId,
		error,
	};
}

/**
 * Make API calls to the transfer status endpoint until a status complete is received,
 * or an error is received, or the timeout is reached.
 *
 * The returned promise is only for testing purposes, and therefore is never rejected,
 * to avoid unhandled rejections in production.
 *
 * @param {Number} siteId -- the site being transferred
 * @param {Number} transferId -- the specific transfer
 * @param {Number} [interval] -- time between poll attemps
 * @param {Number} [timeout] -- time to wait for 'complete' status before bailing
 *
 * @return {Promise} for testing purposes only
 */
export function pollThemeTransferStatus( siteId, transferId, interval = 3000, timeout = 180000 ) {
	const endTime = Date.now() + timeout;
	return dispatch => {
		const pollStatus = ( resolve, reject ) => {
			if ( Date.now() > endTime ) {
				// timed-out, stop polling
				dispatch( transferStatusFailure( siteId, transferId, 'client timeout' ) );
				return resolve();
			}
			return wpcom.undocumented().transferStatus( siteId, transferId )
				.then( ( { status, message, uploaded_theme_slug } ) => {
					dispatch( transferStatus( siteId, transferId, status, message, uploaded_theme_slug ) );
					if ( status === 'complete' ) {
						// finished, stop polling
						return resolve();
					}
					// poll again
					return delay( pollStatus, interval, resolve, reject );
				} )
				.catch( ( error ) => {
					dispatch( transferStatusFailure( siteId, transferId, error ) );
					// error, stop polling
					return resolve();
				} );
		};
		return new Promise( pollStatus );
	};
}

/**
 * Deletes a theme from the given Jetpack site.
 *
 * @param {String} themeId -- Theme to delete
 * @param {Number} siteId -- Site to delete theme from
 *
 * @return {Function} Action thunk
 */
export function deleteTheme( themeId, siteId ) {
	return dispatch => {
		dispatch( {
			type: THEME_DELETE,
			themeId,
			siteId,
		} );
		return wpcom.undocumented().deleteThemeFromJetpack( siteId, themeId )
			.then( ( theme ) => {
				dispatch( {
					type: THEME_DELETE_SUCCESS,
					themeId,
					siteId,
					themeName: theme.name,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_DELETE_FAILURE,
					themeId,
					siteId,
					error
				} );
			} );
	};
}

/**
 * Shows dialog asking user to confirm delete of theme
 * from jetpack site. Deletes theme if user confirms.
 *
 * @param {String} themeId -- Theme to delete
 * @param {Number} siteId -- Site to delete theme from
 *
 * @return {Function} Action thunk
 */
export function confirmDelete( themeId, siteId ) {
	return ( dispatch, getState ) => {
		const { name: themeName } = getTheme( getState(), siteId, themeId );
		const siteTitle = getSiteTitle( getState(), siteId );
		accept(
			i18n.translate(
				'Are you sure you want to delete %(themeName)s from %(siteTitle)s?',
				{ args: { themeName, siteTitle }, context: 'Themes: theme delete confirmation dialog' }
			),
			( accepted ) => {
				accepted && dispatch( deleteTheme( themeId, siteId ) );
			},
			i18n.translate(
				'Delete %(themeName)s',
				{ args: { themeName }, context: 'Themes: theme delete dialog confirm button' }
			),
			i18n.translate( 'Back', { context: 'Theme: theme delete dialog back button' } )
		);
	};
}
