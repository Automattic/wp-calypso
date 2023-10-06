import { AppState } from 'calypso/types';

export function getLivePreviewingTheme( state: AppState ): boolean {
	return state.themes.livePreview.themeId;
}
