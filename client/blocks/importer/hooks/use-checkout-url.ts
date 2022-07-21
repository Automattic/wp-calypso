export function useCheckoutUrl( siteId: number, siteSlug: string ) {
	const plan = 'business';

	return `/checkout/${ siteSlug }/${ plan }`;
}
