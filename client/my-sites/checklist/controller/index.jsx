/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import ChecklistShow from '../checklist-show';

export function show( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	//@TODO This doesn't work until the state gets hydrated....hrmmm
	if ( ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		return page.redirect( '/view/' + get( context, 'params.site_id' ) );
	}

	const displayMode = get( context, 'query.d' );
	context.primary = <ChecklistShow displayMode={ displayMode } />;
	next();
}
