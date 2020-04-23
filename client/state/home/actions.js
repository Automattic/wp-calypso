/**
 * Internal dependencies
 */
import {
	HOME_LAYOUT_REQUEST,
	HOME_LAYOUT_SET,
	HOME_QUICK_LINKS_EXPAND,
	HOME_QUICK_LINKS_COLLAPSE,
} from 'state/action-types';
import 'state/data-layer/wpcom/sites/home/layout';

export const requestHomeLayout = ( siteId ) => ( {
	type: HOME_LAYOUT_REQUEST,
	siteId,
} );

export const setHomeLayout = ( siteId, layout ) => ( {
	type: HOME_LAYOUT_SET,
	siteId,
	layout,
} );

export const expandHomeQuickLinks = () => ( {
	type: HOME_QUICK_LINKS_EXPAND,
} );

export const collapseHomeQuickLinks = () => ( {
	type: HOME_QUICK_LINKS_COLLAPSE,
} );
