import { NEUTRAL_PACK } from './neutral/pack';
import type { BrandPack } from '../engine/types';

export const BRAND_PACKS: BrandPack[] = [ NEUTRAL_PACK ];

export const DEFAULT_PACK_SLUG = NEUTRAL_PACK.slug;

export function getBrandPack( slug: string | undefined ): BrandPack | undefined {
	if ( ! slug ) {
		return undefined;
	}
	return BRAND_PACKS.find( ( pack ) => pack.slug === slug );
}

export function getBrandPackOrDefault( slug: string | undefined ): BrandPack {
	return getBrandPack( slug ) ?? NEUTRAL_PACK;
}

export { NEUTRAL_PACK };
