export default function isReaderTagEmbedPage( url ) {
	const urlObject = new URL( url );
	const urlParams = new URLSearchParams( url.search );
	return urlObject.pathname.includes( '/tag/' ) && urlParams.get( 'type' ) === 'embed';
}
