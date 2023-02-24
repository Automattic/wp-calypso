import { JETPACK_COMPLETE_PLANS } from './constants';

export function isJetpackCompleteSlug( productSlug: string ): boolean {
	return ( JETPACK_COMPLETE_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
