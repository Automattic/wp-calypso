import { AppState } from 'calypso/types';

export function getIsLivePreviewStarted( state: AppState ): boolean {
	return state.themes.livePreview.started;
}
