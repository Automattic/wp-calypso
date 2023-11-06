import { JETPACK_CREATOR_PLANS } from './constants';

export function isJetpackCreatorSlug( productSlug: string ): boolean {
	return ( JETPACK_CREATOR_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
