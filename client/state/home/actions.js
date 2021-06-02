/**
 * Internal dependencies
 */
import {
	HOME_LAYOUT_REQUEST,
	HOME_LAYOUT_SET,
	HOME_LAYOUT_SKIP_CURRENT_VIEW,
	HOME_QUICK_LINKS_EXPAND,
	HOME_QUICK_LINKS_COLLAPSE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/home/layout';
import 'calypso/state/home/init';

export const requestHomeLayout = ( siteId, isDev = false, forcedView = null ) => ( {
	type: HOME_LAYOUT_REQUEST,
	siteId,
	isDev,
	forcedView,
} );

export const skipCurrentViewHomeLayout = ( siteId, reminder = null ) => ( {
	type: HOME_LAYOUT_SKIP_CURRENT_VIEW,
	siteId,
	reminder,
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
