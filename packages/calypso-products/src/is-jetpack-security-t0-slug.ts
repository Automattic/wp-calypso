import { JETPACK_SECURITY_T0_PLANS } from './constants';

export function isJetpackSecurityT0Slug( productSlug: string ): boolean {
	return ( JETPACK_SECURITY_T0_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
