import { AppState } from 'calypso/types';

export function getIsLivePreviewStarted( state: AppState, themeId?: string ): boolean {
	const { livePreview } = state.themes;
	return livePreview.started && ( ! themeId || livePreview.themeId === themeId );
}
