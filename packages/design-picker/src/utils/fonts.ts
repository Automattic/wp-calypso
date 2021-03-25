/**
 * Internal dependencies
 */
import { FONT_TITLES } from '../constants';
import type { Font } from '../types';

export function getFontTitle( fontFamily: Font ): string {
	return FONT_TITLES[ fontFamily ] ?? fontFamily;
}
