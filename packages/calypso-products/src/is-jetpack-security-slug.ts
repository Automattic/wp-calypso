import { JETPACK_SECURITY_PLANS } from './constants';

export function isJetpackSecuritySlug( productSlug: string | null ): boolean {
	if ( ! productSlug ) {
		return false;
	}

	return ( JETPACK_SECURITY_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
