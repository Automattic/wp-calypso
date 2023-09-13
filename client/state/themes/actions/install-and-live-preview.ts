import { CalypsoDispatch } from 'calypso/state/types';
import { installTheme } from './install-theme';
import { redirectToLivePreview } from './redirect-to-live-preview';

export function installAndLivePreview( themeId: string, siteId: number ) {
	return ( dispatch: CalypsoDispatch ) => {
		return dispatch( installTheme( themeId, siteId ) ).then( () => {
			dispatch( redirectToLivePreview( themeId, siteId ) );
		} );
	};
}
