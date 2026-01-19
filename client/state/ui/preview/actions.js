import { PREVIEW_URL_CLEAR } from 'calypso/state/action-types';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import 'calypso/state/ui/init';

export function clearPreviewUrl() {
	return {
		type: PREVIEW_URL_CLEAR,
	};
}

export function closePreview() {
	return ( dispatch ) => {
		dispatch( clearPreviewUrl() );
		dispatch( setLayoutFocus( 'content' ) );
	};
}
