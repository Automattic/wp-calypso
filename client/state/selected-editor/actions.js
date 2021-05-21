/**
 * Internal dependencies
 */
import { EDITOR_TYPE_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/gutenberg';
import 'calypso/state/selected-editor/init';

export const requestSelectedEditor = ( siteId ) => ( {
	type: EDITOR_TYPE_REQUEST,
	siteId,
} );
