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

	// Also try legacy scheme in a hidden iframe as fallback for old Studio app versions.
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
