import { getTheme } from 'calypso/state/themes/selectors';
import type { AppState } from 'calypso/types';

const EMPTY_OBJECT = {};

export function getThemeTierForTheme( state: AppState, themeId: string ) {
	const theme = getTheme( state, 'wpcom', themeId ) || getTheme( state, 'wporg', themeId );
	return theme?.theme_tier || EMPTY_OBJECT;
}
