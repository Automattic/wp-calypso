import { JETPACK_STARTER_PLANS } from './constants';

export function isJetpackStarterSlug( productSlug: string ): boolean {
	return ( JETPACK_STARTER_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
