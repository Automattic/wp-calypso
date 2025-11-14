/**
 * Global map storing transient query params by pathname.
 * This is cleared on page refresh.
 */
const transientQueryParamsMap = new Map< string, Record< string, unknown > >();

export function setTransientQueryParamsAtPathname(
	pathname: string,
	queryParams: Record< string, unknown >
) {
	if ( Object.keys( queryParams ).length > 0 ) {
		transientQueryParamsMap.set( pathname, queryParams );
	} else {
		transientQueryParamsMap.delete( pathname );
	}
}

export function getTransientQueryParamsAtPathname(
	pathname: string
): Record< string, unknown > | undefined {
	return transientQueryParamsMap.get( pathname );
}
