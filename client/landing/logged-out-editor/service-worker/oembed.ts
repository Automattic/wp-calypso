export async function oembedProxy( request: Request ): Promise< Response > {
	const { search } = new URL( request.url );

	const params = search.substr( 1 ).split( '&' );
	const urlKeyPair = params.find( ( p ) => p.startsWith( 'url=' ) );
	if ( ! urlKeyPair ) {
		throw new Error();
	}

	const urlParam = decodeURIComponent( urlKeyPair.substr( 4 ) );
	if ( ! urlParam ) {
		throw new Error();
	}

	const { host } = new URL( urlParam );
	if ( host.includes( 'youtube.com' ) || host.includes( 'youtu.be' ) ) {
		return fetch(
			`https://www.youtube.com/oembed?url=${ encodeURIComponent( urlParam ) }&format=json`
		);
	}

	throw new Error();
}
