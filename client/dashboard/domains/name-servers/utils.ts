export const WPCOM_DEFAULT_NAMESERVERS_REGEX = /^ns[1-4]\.wordpress\.com$/i;

export const HOSTNAME_REGEX =
	/^(?=.{1,255}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const validateHostname = ( hostname: string ) => {
	return HOSTNAME_REGEX.test( hostname );
};

export const areAllWpcomNameServers = ( nameservers?: string[] ) => {
	if ( ! nameservers || nameservers.length === 0 ) {
		return false;
	}

	return nameservers.every( ( nameserver: string ) => {
		return ! nameserver || WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
	} );
};
