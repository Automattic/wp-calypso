export async function fetchAwaitRedirect( url: string ) {
	const { status, redirected } = await fetch( url, { method: 'HEAD', cache: 'no-cache' } );
	return {
		isError: status >= 400,
		isRedirect: redirected,
	};
}
