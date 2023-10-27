// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arePropsEqual( prev: any, next: any, isDebugEnabled = false ): boolean {
	const isDifferent: Record< string, object > = {};
	let isDeepDiffFound = false;
	Object.keys( prev ).forEach( ( key: string ) => {
		isDifferent[ key ] = { verdict: false };
		if ( prev[ key ] !== next[ key ] ) {
			const isDeepDiff = JSON.stringify( prev[ key ] ) !== JSON.stringify( next[ key ] );
			if ( isDebugEnabled ) {
				isDifferent[ key ] = {
					verdict: true,
					prev,
					next,
					isDeepDiff,
				};
			}
			isDeepDiffFound = isDeepDiff;
		}
	} );
	if ( isDebugEnabled ) {
		// eslint-disable-next-line no-console
		console.info( { isDifferent, isDeepDiffFound } );
	}
	return ! isDeepDiffFound;
}
