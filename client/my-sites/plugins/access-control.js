/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import notices from 'notices';

const getHasRightsToManagePlutins = ( selectedOrAll ) => {
	return selectedOrAll.some( ( site ) => site.capabilities && site.capabilities.manage_options );
};

const hasRestrictedAccess = ( site, hasRightsToManagePlutins, isMinJetpackVersionValidationFailed ) => {
	// Display a 404 to users that don't have the rights to manage plugins
	if ( ! hasRightsToManagePlutins ) {
		return {
			title: i18n.translate( 'Not Available' ),
			line: i18n.translate( 'The page you requested could not be found' ),
			illustration: '/calypso/images/illustrations/illustration-404.svg',
			fullWidth: true
		};
	} else if ( isMinJetpackVersionValidationFailed ) {
		notices.warning(
			i18n.translate( 'Jetpack %(version)s is required to take full advantage of plugin management in %(site)s.', {
				args: {
					version: config( 'jetpack_min_version' ),
					site: site.domain
				}
			} ),
			{
				button: i18n.translate( 'Update now' ),
				href: site.options.admin_url + 'plugins.php?plugin_status=upgrade',
				dismissID: 'allSitesNotOnMinJetpackVersion' + config( 'jetpack_min_version' ) + '-' + site.ID
			}
		);
	}
};

export default { getHasRightsToManagePlutins, hasRestrictedAccess };
