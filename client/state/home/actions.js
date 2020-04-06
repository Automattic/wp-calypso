/**
 * Internal dependencies
 */
import { HOME_LAYOUT_REQUEST, HOME_LAYOUT_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/home/layout';

export const requestHomeLayout = siteId => ( {
	type: HOME_LAYOUT_REQUEST,
	siteId,
} );

export const setHomeLayout = ( siteId, layout ) => ( {
	type: HOME_LAYOUT_SET,
	siteId,
	layout,
} );
