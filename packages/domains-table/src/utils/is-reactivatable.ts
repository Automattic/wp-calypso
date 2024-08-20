import { ResponseDomain } from './types';

export function isDomainReactivatable( domain: ResponseDomain ) {
	return 'disabled' === domain.sslStatus && ! domain.isRenewable && domain.isRedeemable;
}
