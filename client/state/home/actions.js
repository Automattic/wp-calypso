/**
 * Internal dependencies
 */
import { HOME_LAYOUT_REQUEST, HOME_LAYOUT_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/home/layout';

export const requestHomeLayout = ( siteId, isNowLaunched ) => ( {
	type: HOME_LAYOUT_REQUEST,
	siteId,
	isNowLaunched,
} );

export const setHomeLayout = ( siteId, layout ) => ( {
	type: HOME_LAYOUT_SET,
	siteId,
	layout,
} );
