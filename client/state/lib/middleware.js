/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_SUPER_PROPS_UPDATE
} from 'state/action-types';
import analytics from 'lib/analytics';
import { getSelectedSite } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

const updateSelectedSiteForAnalytics = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	const user = getCurrentUser( state );
	const siteCount = get( user, 'site_count', 0 );
	analytics.setSelectedSite( selectedSite );
	analytics.setSiteCount( siteCount );
};

export const handlers = {
	[ ANALYTICS_SUPER_PROPS_UPDATE ]: updateSelectedSiteForAnalytics,
};

export const libraryMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};

export default libraryMiddleware;
