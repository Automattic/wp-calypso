import { addQueryArgs, getQueryArgs } from '@wordpress/url';

export function addTransientViewPropertiesToQueryParams( path: string ) {
	const transientParams = [ 'page', 'search' ];

	const currentArgs = getQueryArgs( window.location.href );
	const trasientArgs = Object.fromEntries(
		Object.entries( currentArgs ).filter( ( [ key ] ) => transientParams.includes( key ) )
	);

	return addQueryArgs( path, trasientArgs );
}
