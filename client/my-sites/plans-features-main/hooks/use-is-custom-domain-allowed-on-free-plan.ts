import config from '@automattic/calypso-config';
import { getTld } from 'calypso/lib/domains';

const useIsCustomDomainAllowedOnFreePlan = ( domainName?: string ) => {
	if ( ! domainName ) {
		return false;
	}

	return config.isEnabled( 'domains/blog-domain-free-plan' ) && getTld( domainName ) === 'blog';
};

export default useIsCustomDomainAllowedOnFreePlan;
