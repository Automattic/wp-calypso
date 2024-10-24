import { Theme } from 'calypso/types';

export function isFullSiteEditingTheme( theme: Theme | null ): boolean {
	return !! theme?.block_theme;
}
