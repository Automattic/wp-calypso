import config from '@automattic/calypso-config';
import { getTld } from 'calypso/lib/domains';

// TODO
// it's not really a hook now, but it eventually will contain a request fetching assigned variations from ExPlat endpoints
const useIsCustomDomainAllowedOnFreePlan = ( domainName?: string ) => {
	if ( ! domainName ) {
		return false;
	}

	return config.isEnabled( 'domains/blog-domain-free-plan' ) && getTld( domainName ) === 'blog';
};

export default useIsCustomDomainAllowedOnFreePlan;
