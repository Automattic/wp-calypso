export default function headerImage( previewDoc, customizations ) {
	if ( ! customizations.headerImage ) {
		return;
	}
	const headerImageSelector = [
		'.header-image a img[src]',
		'.header-image img[src]',
		'.site-header-image img',
		'.header-image-link img[src]',
		'img.header-image[src]',
		'img.header-img[src]',
		'img.headerimage[src]',
		'img.custom-header[src]',
		'.featured-header-image a img[src]',
	].join();
	const headerImageElement = previewDoc.querySelector( headerImageSelector );
	if ( ! headerImageElement ) {
		return;
	}
	if ( ! customizations.headerImage.headerImageUrl ) {
		headerImageElement.style.display = 'none';
		return;
	}
	headerImageElement.src = customizations.headerImage.headerImageUrl;
	headerImageElement.style.display = 'block';
}
