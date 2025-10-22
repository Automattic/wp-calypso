export function isDashboardBackport() {
	return ! [ '/manage', '/ciab' ].some(
		( path ) => window?.location?.pathname?.startsWith( path )
	);
}
