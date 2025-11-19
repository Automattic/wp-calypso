// Studio URL scheme - changed from wpcom-local-dev to wp-studio
// For backward compatibility, we try both schemes to support both old and new Studio app versions
const STUDIO_URL_SCHEME = 'wp-studio';
const STUDIO_URL_SCHEME_LEGACY = 'wpcom-local-dev';

// Opens Studio sync URL with backward compatibility support.
const openSyncUrlInStudio = ( studioSiteId: string, siteId: number ) => {
	const path = `sync-connect-site?studioSiteId=${ studioSiteId }&remoteSiteId=${ siteId }`;
	const newSchemeUrl = `${ STUDIO_URL_SCHEME }://${ path }`;
	const legacySchemeUrl = `${ STUDIO_URL_SCHEME_LEGACY }://${ path }`;

	// Use new scheme for new Studio app versions.
	window.location.href = newSchemeUrl;

	// Fallback to legacy scheme for old Studio app versions. It will be blocked by the browser
	// if scheme is not registered.
	setTimeout( () => {
		if ( document.hasFocus() ) {
			window.location.href = legacySchemeUrl;
		}
	}, 1000 );
};

export default openSyncUrlInStudio;
