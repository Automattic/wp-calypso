export async function fetchIsRedirect( url: string ) {
	const { redirected } = await fetch( url, { method: 'HEAD', cache: 'no-cache' } );
	return redirected;
}
