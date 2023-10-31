// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Compares the props with different references using JSON.stringify
 * to make sure if there is an actual serializable difference in the props passed
 * @param prev props previously
 * @param next props next
 * @param isDebugEnabled
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arePropsEqual( prev: any, next: any, isDebugEnabled = false ): boolean {
	const diff: Record< string, object > = {};
	let isDeepDiffFound = false;
	Object.keys( prev ).forEach( ( key: string ) => {
		diff[ key ] = { verdict: false };
		/**
		 * If there is a difference in the reference we dig deeper
		 * to see if there is an actual serializable difference
		 * in the relevant prop
		 */
		if ( prev[ key ] !== next[ key ] ) {
			const isDeepDiff = JSON.stringify( prev[ key ] ) !== JSON.stringify( next[ key ] );
			if ( isDebugEnabled ) {
				diff[ key ] = {
					isRefDiff: true,
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
		console.info( { diff, isDeepDiffFound } );
	}
	return ! isDeepDiffFound;
}
