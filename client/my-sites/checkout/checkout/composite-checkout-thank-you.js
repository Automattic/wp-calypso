export function getThankYouPageUrl( { siteId } = {} ) {
	// TODO: perform logic to retrieve other urls
	return `/checkout/thank-you/${ siteId || 'no-site' }`;
}
