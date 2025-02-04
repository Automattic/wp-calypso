import { JETPACK_SECURITY_T1_PLANS } from './constants';

export function isJetpackSecurityT1Slug( productSlug: string ): boolean {
	return ( JETPACK_SECURITY_T1_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
