export function withoutHttp( url: string ): string {
	return url.replace( /^https?:\/\//, '' );
}
