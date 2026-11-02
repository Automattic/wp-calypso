/** Where an agency met the link, sent as `utm_content`. */
export type SpacefastPlacement = 'sidebar' | 'dev_tools';

export function getSpacefastUrl( placement: SpacefastPlacement ) {
	const url = new URL( 'https://spacefast.com/' );
	url.searchParams.set( 'utm_source', 'a4a' );
	url.searchParams.set( 'utm_medium', 'dashboard' );
	url.searchParams.set( 'utm_campaign', 'spacefast-launch' );
	url.searchParams.set( 'utm_content', placement );
	return url.toString();
}
