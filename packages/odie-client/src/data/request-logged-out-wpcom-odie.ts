interface RequestOptions {
	body?: Record< string, unknown >;
	method?: 'GET' | 'POST';
	signal?: AbortSignal;
}

export const requestLoggedOutWpcomOdie = async < T >(
	path: string,
	{ body, method = 'GET', signal }: RequestOptions = {}
): Promise< T > => {
	const response = await fetch( `https://public-api.wordpress.com/wpcom/v2${ path }`, {
		body: body ? JSON.stringify( body ) : undefined,
		credentials: 'omit',
		headers: body ? { 'Content-Type': 'application/json' } : undefined,
		method,
		signal,
	} );
	const data = ( await response.json() ) as T & { message?: string };

	if ( ! response.ok ) {
		throw new Error( data.message || response.statusText );
	}

	return data;
};
