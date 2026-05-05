export function getLandingUrl(): string {
	return '/reader/fediverse';
}
export function getConnectUrl(): string {
	return '/reader/fediverse/connect';
}
export function getAccountUrl(
	connectionId: number,
	tab: 'timeline' | 'profile' | 'settings' = 'timeline'
): string {
	return `/reader/fediverse/${ connectionId }/${ tab }`;
}
