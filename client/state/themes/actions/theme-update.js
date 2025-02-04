import { CALYPSO_CONTACT } from '@automattic/urls';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	THEMES_UPDATE,
	THEMES_UPDATE_FAILURE,
	THEMES_UPDATE_SUCCESS,
} from 'calypso/state/themes/action-types';
import { requestThemes } from 'calypso/state/themes/actions';

import 'calypso/state/themes/init';

/**
 * Updates the themes to the a newer version
 * @param {Array} themeSlugs    Array of themes to be updated.
 * @param {number} siteId       Site ID
 * @param {boolean} autoupdate  Whether should enable or disable the auto update.
 * @returns {Function}          Action thunk
 */
export function updateThemes( themeSlugs, siteId, autoupdate = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEMES_UPDATE,
			themeSlugs,
			siteId,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/themes`, {
				action: 'update',
				themes: themeSlugs,
				autoupdate,
			} )
			.then( ( response ) => {
				const successfullyUpdatedThemes = response.themes.map( ( theme ) => theme.id );
				dispatch( themesUpdated( siteId, successfullyUpdatedThemes ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEMES_UPDATE_FAILURE,
					themeSlugs,
					siteId,
				} );

				if ( error.error === 'theme_not_found' ) {
					dispatch( errorNotice( translate( 'Theme not yet available for this site' ) ) );
				} else {
					dispatch(
						errorNotice(
							translate(
								'Unable to activate theme. {{contactSupportLink}}Contact support{{/contactSupportLink}}.',
								{
									components: {
										contactSupportLink: (
											<a target="_blank" href={ CALYPSO_CONTACT } rel="noreferrer" />
										),
									},
								}
							)
						)
					);
				}
			} );
	};
}

/**
 * Updates the state and UI after successfuly update the themes.
 * @param {number} siteId
 * @param {Array} themeSlugs
 * @returns
 */
export function themesUpdated( siteId, themeSlugs ) {
	const themeUpdatedThunk = ( dispatch ) => {
		dispatch( {
			type: THEMES_UPDATE_SUCCESS,
			themeSlugs,
			siteId,
		} );

		// There are instances where switching themes toggles menu items. This action refreshes
		// the admin bar to ensure that those updates are displayed in the UI.
		dispatch( requestAdminMenu( siteId ) );

		dispatch( requestThemes( siteId, {} ) );
	};

	return themeUpdatedThunk;
}
