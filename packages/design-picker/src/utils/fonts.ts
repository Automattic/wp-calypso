/**
 * Internal dependencies
 */
import { fontTitles } from '../constants';
import type { Font } from '../types';

export function getFontTitle( fontFamily: Font ): string {
	return fontTitles[ fontFamily ] ?? fontFamily;
}
