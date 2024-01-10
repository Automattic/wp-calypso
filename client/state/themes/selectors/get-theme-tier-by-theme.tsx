import { getTheme } from 'calypso/state/themes/selectors';
import type { AppState } from 'calypso/types';

export default ( state: AppState, themeId: string ) => {
	const theme = getTheme( state, 'wpcom', themeId );
	return theme?.theme_tier || {};
};
