import { getLivePreviewUrl } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';

export function redirectToLivePreview( themeId: string, siteId: number ) {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const url = getLivePreviewUrl( getState(), themeId, siteId, {
			wpcomBackUrl: window.location.href,
		} );
		if ( url ) {
			window.location.href = url;
		}
	};
}
