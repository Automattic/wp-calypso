// Studio URL scheme - changed from wpcom-local-dev to wp-studio
// For backward compatibility, we try both schemes to support both old and new Studio app versions
const STUDIO_URL_SCHEME = 'wp-studio';
const STUDIO_URL_SCHEME_LEGACY = 'wpcom-local-dev';

/**
 * Opens Studio sync URL with backward compatibility support.
 * Tries both the new and old schemes to ensure compatibility with
 * both old and new Studio app versions. We need to remove or update this once we have
 * large number of users on the new version.
 * @param {string} studioSiteId - The Studio site ID
 * @param {number} siteId - The remote site ID
 */
const openSyncUrlInStudio = ( studioSiteId: string, siteId: number ) => {
	const path = `sync-connect-site?studioSiteId=${ studioSiteId }&remoteSiteId=${ siteId }`;
	const newSchemeUrl = `${ STUDIO_URL_SCHEME }://${ path }`;
	const legacySchemeUrl = `${ STUDIO_URL_SCHEME_LEGACY }://${ path }`;

	// Try new scheme first (for new Studio app versions)
	// Use main window location for primary attempt
	window.location.href = newSchemeUrl;

	// Also try legacy scheme in a hidden iframe as fallback for old Studio app versions
	// This ensures backward compatibility
	const iframe = document.createElement( 'iframe' );
	iframe.style.display = 'none';
	iframe.src = legacySchemeUrl;
	document.body.appendChild( iframe );

	// Clean up the iframe after a short delay
	setTimeout( () => {
		if ( iframe.parentNode ) {
			iframe.parentNode.removeChild( iframe );
		}
	}, 1000 );
};

export default openSyncUrlInStudio;
