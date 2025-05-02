import { addQueryArgs } from 'calypso/lib/url';
import { getCustomizerFocus } from 'calypso/my-sites/customize/panels';
import { AppState } from 'calypso/types';
import getSiteAdminUrl from './get-site-admin-url';

/**
 * Returns the customizer URL for a site, or null if it cannot be determined.
 * @param   {Object}  state        Global state tree
 * @param   {?number} siteId       Site ID
 * @param   {?string} [panel]        Optional panel to autofocus
 * @param   {?string} [returnUrl]    Optional return url for when the user closes the customizer
 * @param   {?string} [guide]        Optional parameter to show a help guide in the customizer. possible values:
 *                                 'add-menu' and 'social-media' show custom guides, any other value shows the default guide
 * @returns {string}               Customizer URL
 */
export default function getCustomizerUrl(
	state: AppState,
	siteId: number | undefined | null,
	panel?: string | undefined | null,
	returnUrl?: string | undefined | null,
	guide?: string | undefined | null
): string | null {
	const adminUrl = getSiteAdminUrl( state, siteId, 'customize.php' );

	if ( ! adminUrl ) {
		return null;
	}

	if ( ! returnUrl && 'undefined' !== typeof window ) {
		returnUrl = window.location.href;
	}

	return addQueryArgs(
		{
			return: returnUrl,
			...( panel ? getCustomizerFocus( panel ) : {} ),
			guide,
		},
		adminUrl
	);
}
