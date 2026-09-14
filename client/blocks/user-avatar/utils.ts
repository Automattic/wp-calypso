export function getProcessedGravatarUrl( avatarUrl?: string ): string | null {
	if ( ! avatarUrl ) {
		return null;
	}

	try {
		const url = new URL( avatarUrl );
		url.searchParams.set( 'd', 'mm' ); // Shows a consistent default avatar, instead of a random image.
		url.searchParams.set( 'r', 'G' );
		url.searchParams.set( 's', '208' );
		return url.toString();
	} catch {
		return null;
	}
}
