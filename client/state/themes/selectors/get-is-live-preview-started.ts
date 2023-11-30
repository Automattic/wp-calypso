import { AppState } from 'calypso/types';

export function getIsLivePreviewStarted( state: AppState, themeId: string ): boolean {
	return state.themes.livePreview.started && state.themes.livePreview.themeId === themeId;
}
