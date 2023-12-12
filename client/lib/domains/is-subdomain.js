export function isSubdomain( domainName ) {
	return (
		domainName &&
		domainName.match(
			/^([a-z0-9_]([a-z0-9\-_]*[a-z0-9_])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/
		)
	);
}
