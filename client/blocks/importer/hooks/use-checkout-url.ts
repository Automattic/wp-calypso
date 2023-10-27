export function useCheckoutUrl(
	siteId: number | undefined | null,
	siteSlug: string | undefined | null
): string {
	const plan = 'business';
	if ( ! siteSlug ) {
		return `/checkout/${ plan }`;
	}
	return `/checkout/${ siteSlug }/${ plan }`;
}
