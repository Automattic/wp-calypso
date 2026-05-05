export function getLandingUrl(): string {
	return '/reader/fediverse';
}
export function getConnectUrl(): string {
	return '/reader/fediverse/connect';
}
export function getOauthCallbackUrl(): string {
	return '/reader/fediverse/oauth-callback';
}
export function getAccountUrl(
	connectionId: number,
	tab: 'timeline' | 'profile' | 'settings' = 'timeline'
): string {
	return `/reader/fediverse/${ connectionId }/${ tab }`;
}
