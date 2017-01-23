export default function siteLogo( previewDoc, customizations ) {
	if ( ! customizations.siteLogo ) {
		return;
	}
	const siteLogoSelector = [
		'.site-logo[src]',
	].join();
	const siteLogoElement = previewDoc.querySelector( siteLogoSelector );
	if ( ! siteLogoElement ) {
		return;
	}
	if ( ! customizations.siteLogo.logoUrl ) {
		siteLogoElement.style.display = 'none';
		return;
	}
	siteLogoElement.src = customizations.siteLogo.logoUrl;
	siteLogoElement.style.display = 'block';
}
