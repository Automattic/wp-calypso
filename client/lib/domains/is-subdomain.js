export function isSubdomain( domainName ) {
	return (
		domainName &&
		domainName.match( /\..+\.[a-z]{2,3}\.[a-z]{2}$|\..+\.[a-z]{3,}$|\..{4,}\.[a-z]{2}$/ )
	);
}
