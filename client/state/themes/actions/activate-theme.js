import { translate } from 'i18n-calypso';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { THEME_ACTIVATE, THEME_ACTIVATE_FAILURE } from 'calypso/state/themes/action-types';
import { themeActivated } from 'calypso/state/themes/actions/theme-activated';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to activate a specific theme on a given site.
 *
 * @param {string} themeId   Theme ID
 * @param {number} siteId    Site ID
 * @param {string} source    The source that is requesting theme activation, e.g. 'showcase'
 * @param {boolean} purchased Whether the theme has been purchased prior to activation
 * @param {boolean} dontChangeHomepage Prevent theme from switching homepage content if this is what it'd normally do when activated
 * @returns {Function}           Action thunk
 */
export function activateTheme(
	themeId,
	siteId,
	source = 'unknown',
	purchased = false,
	dontChangeHomepage = false
) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_ACTIVATE,
			themeId,
			siteId,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/themes/mine`, {
				theme: themeId,
				...( dontChangeHomepage && { dont_change_homepage: true } ),
			} )
			.then( ( theme ) => {
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch( themeActivated( themeStylesheet, siteId, source, purchased ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_ACTIVATE_FAILURE,
					themeId,
					siteId,
					error,
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
