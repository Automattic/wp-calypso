export function isDashboardBackport() {
	return ! [ '/v2', '/ciab' ].some( ( path ) => window?.location?.pathname?.startsWith( path ) );
}
