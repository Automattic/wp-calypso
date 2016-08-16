export default function siteTitle( previewDoc, customizations ) {
	if ( ! customizations.siteTitle ) {
		return;
	}
	const blognameElement = previewDoc.querySelector( '.site-title a' );
	const blogdescriptionElement = previewDoc.querySelector( '.site-description' );
	if ( blognameElement ) {
		blognameElement.innerHTML = customizations.siteTitle.blogname;
	}
	if ( blogdescriptionElement ) {
		blogdescriptionElement.innerHTML = customizations.siteTitle.blogdescription;
	}
}
