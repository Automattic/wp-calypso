/** @ssr-ready **/

/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export const oldShowcaseUrl = '//wordpress.com/themes/';

export function getThemes( state ) {
	return state.themes.themes.get( 'themes' ).toJS();
}

export function getThemeById( state, id ) {
	const theme = state.themes.themes.getIn( [ 'themes', id ] );
	return theme ? theme.toJS() : undefined;
}

export function getThemeDetailsUrl( state, theme ) {
	const site = getSelectedSite( state );

	if ( site && isJetpackSite( state, site.ID ) ) {
		return site.options.admin_url + 'themes.php?theme=' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }`;
	}

	return baseUrl + ( site ? `/${ getSiteSlug( state, site.ID ) }` : '' );
}
