/**
 * External dependencies
 */
import React from 'react';
import { isEqual } from 'lodash';

/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { queryToFilterState } from 'calypso/state/activity-log/utils';
import { recordTrack } from 'calypso/reader/stats';
import { setFilter } from 'calypso/state/activity-log/actions';
import ActivityLog from 'calypso/my-sites/activity/activity-log';
import ActivityLogV2 from 'calypso/my-sites/activity/activity-log-v2';
import config from 'calypso/config';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';

function queryFilterToStats( filter ) {
	// These values are hardcoded so that the attributes that we collect via stats are not unbound
	const possibleGroups = [
		'attachment',
		'comment',
		'core',
		'feedback',
		'jetpack',
		'menu',
		'module',
		'monitor',
		'pingback',
		'plan',
		'plugin',
		'post',
		'protect',
		'rewind',
		'setting',
		'theme',
		'user',
		'widget',
	];

	const groupStats = {};
	possibleGroups.forEach( ( groupSlug ) => {
		groupStats[ 'filter_group_' + groupSlug ] = !! (
			filter.group && filter.group.indexOf( groupSlug ) >= 0
		);
	} );

	return {
		...groupStats,
		filter_date_on: !! filter.on || !! filter.before || !! filter.after,
		page: filter.page ? parseInt( filter.page ) : 1,
	};
}

export function activity( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	const filter = siteId && getActivityLogFilter( state, siteId );
	const queryFilter = queryToFilterState( context.query );

	if ( ! isEqual( filter, queryFilter ) ) {
		context.store.dispatch( {
			...setFilter( siteId, queryFilter ),
			meta: { skipUrlUpdate: true },
		} );
	}

	recordTrack( 'calypso_activitylog_view', queryFilterToStats( queryFilter ) );
	context.primary = config.isEnabled( 'activity-log/v2' ) ? (
		<ActivityLogV2 />
	) : (
		<ActivityLog siteId={ siteId } context={ context } />
	);

	next();
}
