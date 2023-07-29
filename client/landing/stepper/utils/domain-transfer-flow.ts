import { GOOGLE_DOMAIN_TRANSFER } from '@automattic/onboarding';

export const isGoogleDomainsTransferFlow = () => {
	return GOOGLE_DOMAIN_TRANSFER === window.location.pathname.split( '/' )[ 2 ];
};
