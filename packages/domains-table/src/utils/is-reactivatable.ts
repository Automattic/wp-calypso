import { ResponseDomain } from './types';

export function isDomainReactivatable( domain: ResponseDomain ) {
	return (
		! domain.isRenewable && domain.isRedeemable
	);
}
