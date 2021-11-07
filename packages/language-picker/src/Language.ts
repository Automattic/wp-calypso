/**
 * External dependencies
 */
import type { Language } from '@automattic/languages';

export type { Language };

export type LanguageGroup = {
	id: string;
	name: () => string;
	subTerritories?: string[];
	countries?: string[];
	default?: boolean;
};
