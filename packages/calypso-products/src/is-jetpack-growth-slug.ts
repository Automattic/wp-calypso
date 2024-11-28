import { JETPACK_GROWTH_PLANS } from './constants';

export function isJetpackGrowthSlug( productSlug: string ): boolean {
	return ( JETPACK_GROWTH_PLANS as ReadonlyArray< string > ).includes( productSlug );
}
