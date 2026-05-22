import type { BrandTokens, BrandTypography, FontCase, FontRole } from '../types';

export type BrandPackFont = {
	role: FontRole;
	family: string;
	// Either ship a font file in the pack, pull a Google Font, or use a
	// system font stack. Exactly one source should be set.
	fileUrl?: string;
	fileName?: string;
	googleFamily?: string;
	systemFamily?: string;
	weight?: number;
	case?: FontCase;
	tracking?: string;
};

export type BrandPack = {
	slug: string;
	name: string;
	tokens: BrandTokens;
	typography: BrandTypography;
	logoLightUrl: string;
	logoLightFileName: string;
	logoDarkUrl?: string;
	logoDarkFileName?: string;
	fonts: BrandPackFont[];
	designMdText: string;
};
