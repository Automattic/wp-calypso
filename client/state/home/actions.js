/**
 * Internal dependencies
 */
import { HOME_REQUEST, HOME_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/home';

export const requestHomeData = siteId => ( {
	type: HOME_REQUEST,
	siteId,
} );

export const setHomeData = ( siteId, homeData ) => ( {
	type: HOME_SET,
	homeData,
	siteId,
} );
