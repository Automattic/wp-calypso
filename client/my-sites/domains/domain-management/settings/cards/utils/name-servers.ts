import {
	WPCOM_DEFAULT_NAMESERVERS,
	WPCOM_DEFAULT_NAMESERVERS_REGEX,
} from 'calypso/my-sites/domains/domain-management/name-servers/constants';

export const hasDefaultWpcomNameservers = ( nameserversToCheck: string[] | null ) => {
	if ( ! nameserversToCheck || nameserversToCheck.length === 0 ) {
		return false;
	}

	return (
		nameserversToCheck.length === WPCOM_DEFAULT_NAMESERVERS.length &&
		nameserversToCheck.every( ( nameserver ) => {
			return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} )
	);
};
