import { getRootDomain } from 'calypso/lib/domains/utils';

export function isSubdomain( domainName: string, tld?: string ): boolean {
	if ( ! domainName || domainName === '' ) {
		return false;
	}

	const isValidSubdomain = Boolean(
		domainName.match(
			/^([a-z0-9_]([a-z0-9\-_]*[a-z0-9_])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/
		)
	);

	// If it doesn't even match the subdomain "shape", just return false.
	if ( ! isValidSubdomain ) {
		return false;
	}

	// If the second param isn't a string, treat it as though no TLD was passed
	// For situations where function is called like: map( domains, 'name' ).every( isSubdomain )
	let lowerTld: string | undefined;
	if ( typeof tld === 'string' ) {
		lowerTld = tld.toLowerCase();
	}

	if ( ! lowerTld ) {
		// No TLD provided => original logic based on hard coded list of SLDs
		return getRootDomain( domainName ) !== domainName;
	}

	// ----- TLD provided: let’s verify the domain actually ends in that TLD. -----

	const lowerDomain = domainName.toLowerCase();
	const domainParts = lowerDomain.split( '.' );
	const tldParts = lowerTld.split( '.' );

	// If domain doesn't have at least as many parts as the TLD, can't match it.
	if ( domainParts.length < tldParts.length ) {
		// Fallback to list of SLDs logic
		return getRootDomain( domainName ) !== domainName;
	}

	// Compare trailing parts of the domain to see if they match exactly the TLD
	const domainEnding = domainParts.slice( domainParts.length - tldParts.length );

	if ( ! arraysMatch( domainEnding, tldParts ) ) {
		// If it doesn't actually end with the TLD, fallback to list of SLDs logic
		return getRootDomain( domainName ) !== domainName;
	}

	// At this point, the domain does end with the TLD. Count leftover labels.
	// Example:
	//   subdomain.domain.edu.my
	//   domainParts = [ 'subdomain', 'domain', 'edu', 'my' ]
	//   tldParts    = [ 'edu', 'my' ]
	//   leftover    = [ 'subdomain', 'domain' ] => leftover.length = 2 => subdomain
	const leftover = domainParts.slice( 0, domainParts.length - tldParts.length );

	// If leftover is > 1, that means we have at least "sub.whatever.edu.my", so subdomain = true
	// If leftover is <= 1, that’s effectively "domain.edu.my" => not a subdomain
	return leftover.length > 1;
}

function arraysMatch( a: string[], b: string[] ): boolean {
	if ( a.length !== b.length ) {
		return false;
	}
	return a.every( ( val, i ) => val === b[ i ] );
}
